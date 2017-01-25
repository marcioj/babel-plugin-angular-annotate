export default function ({ types: t }) {
  const TYPES = /(controller|config|service|filter|animation|provider|directive|factory|run|component)/;

  const presets = {
    'angular': [
      ['$injector.invoke', ['$injectFunction']],
      ['$httpProvider.interceptors.push', ['$injectFunction']]
    ],
    'ngRoute': [
      ['$routeProvider.when', ['_', {
        'controller': '$injectFunction',
        'resolve': '$injectObject'
      }]]
    ],
    'ui.router': [
      ['$stateProvider.state', ['_', {
        'resolve': '$injectObject',
        'controller': '$injectFunction',
        'onEnter': '$injectFunction',
        'onExit': '$injectFunction'
      }]]
    ],
    'ngMaterial': [
      ['$mdDialog.show', [{
        'controller': '$injectFunction'
      }]],
      ['$mdToast.show', [{
        'controller': '$injectFunction'
      }]],
      ['$mdBottomSheet.show', [{
        'controller': '$injectFunction'
      }]]
    ]
  };

  let configuration;

  function normalizeConfig(config) {
    return config.reduce(function(acc, entry) {
      if (typeof entry === 'string') {
        if (!(entry in presets)) {
          throw new Error(`Cannot find preset named '${entry}'`);
        }
        return acc.concat(presets[entry]);
      } else {
        acc.push(entry);
        return acc;
      }
    }, []);
  }

  function annotateUsingConfiguration(memberExprPath) {
    let config = normalizeConfig(configuration);
    for(let entry of config) {
      let [memberExpr, params] = entry;
      let memberExprParts = memberExpr.split('.');
      let identifier = memberExprParts[0];
      let methods = memberExprParts.slice(1);

      if (matchesPattern(memberExprPath, identifier, methods[0])) {
        let currentMemberPath = memberExprPath;
        methods = methods.slice(1);

        for(let method of methods) {
          currentMemberPath = currentMemberPath.parentPath;
          if (!currentMemberPath.get('property').isIdentifier({ name: method })) {
            return;
          }
        }

        for (let index = 0; index < params.length; index++) {
          let param = params[index];
          let paramPath = currentMemberPath.parentPath.get('arguments')[index];

          if (typeof param === 'string') {
            if (param === '$injectFunction') {
              annotateFunction(paramPath);
            } else if (param === '$injectObject') {
              annotateObjectProperties(paramPath);
            }
          } else if (typeof param === 'object' && param !== null) {
            eachObjectProperty(paramPath, property => { // eslint-disable-line no-loop-func
              if (property.get('key').isIdentifier()) {
                let strategy = param[property.node.key.name];
                if (strategy === '$injectFunction') {
                  annotateFunction(property.get('value'));
                } else if (strategy === '$injectObject') {
                  annotateObjectProperties(property.get('value'));
                }
              }
            });
          }
        }
      }
    }
  }

  function findRootDeclarator(path) {
    if (path.isIdentifier()) {
      let binding = path.scope.getBinding(path.node.name);

      if (binding) {
        let bpath = binding.path;

        if (bpath.isVariableDeclarator()) {
          if (bpath.get('init').isIdentifier()) {
            return findRootDeclarator(bpath.get('init'));
          } else {
            return bpath;
          }
        }

        if (bpath.isFunction() || bpath.isClassDeclaration() || bpath.isIdentifier()) {
          return bpath;
        }
      }
    }
  }

  function matchesPattern(memberExprPath, identifierName, methodName) {
    if (!memberExprPath.get('property').isIdentifier({ name: methodName })) {
      return false;
    }
    let object = memberExprPath.get('object');

    // resolve chained calls
    while (object.isCallExpression()) {
      if (object.get('callee').isMemberExpression()) {
        object = object.get('callee.object');
      }
    }

    let declarator = findRootDeclarator(object);
    return declarator && declarator.isIdentifier({ name: identifierName });
  }

  function annotateProvide(memberExprPath) {
    let types = ['decorator', 'service', 'factory', 'provider'];
    let matchedType;

    function matchesProvide(type) {
      if (matchesPattern(memberExprPath, '$provide', type)) {
        matchedType = type;
        return true;
      }
    }

    if (types.some(matchesProvide)) {
      let func = last(memberExprPath.parentPath.get('arguments'));
      annotateFunction(func);
      if (matchedType === 'provider') {
        func.traverse(providerGetVisitor);
      }
    }
  }

  let defaultVisitor = {
    MemberExpression(path) {
      annotateUsingConfiguration(path);
    }
  };

  let configVisitor = {
    MemberExpression(path) {
      annotateUsingConfiguration(path);
      annotateProvide(path);
    }
  };

  let directiveControllerVisitor = {
    Property(path) {
      if (path.get('key').isIdentifier({ name: 'controller' })) {
        annotateFunction(path.get('value'));
        path.stop();
      }
    }
  };

  let providerGetVisitor = {
    ExpressionStatement(path) {
      if (path.get('expression.left').matchesPattern('this.$get')) {
        annotateFunction(path.get('expression.right'));
        path.stop();
      }
    }
  };

  function isAngularModule(path) {
    if (!path.isCallExpression()) { return false; }

    while(path.get('callee').isMemberExpression() && !path.get('callee').matchesPattern('angular.module')) {
      path = path.get('callee.object');
    }

    if (path.isIdentifier()) {
      let declarator = findRootDeclarator(path);
      if (declarator && declarator.get('init')) {
        path = declarator.get('init');
        return isAngularModule(path);
      }
    }

    if (path.get('callee').matchesPattern('angular.module')) {
      annotateModuleConfigFunction(path.get('callee'));
      return true;
    }

    return false;
  }

  function getTypeName(path) {
    if (path.isCallExpression() && path.get('callee').isMemberExpression()) {
      return path.node.callee.property.name;
    }
  }

  function getFunctionExpressionFromConstructor(classPath) {
    let functionExpression;
    let visitor = {
      ClassMethod(path) {
        if (path.node.kind === 'constructor') {
          functionExpression = path;
          path.stop();
        }
      }
    };
    classPath.traverse(visitor);
    return functionExpression;
  }

  function annotateFunctionImpl(func, original) {
    if (!func) { return; }

    if (func.isFunction()) {
      let varLiterals = func.node.params.map(i => t.stringLiteral(i.name));
      varLiterals.push(original.node);
      original.replaceWith(
        t.arrayExpression(varLiterals)
      );
    }

    if (func.isClass()) {
      const node = func.node;
      const siblings = func.parent.body;
      const nextSiblings = siblings.slice(siblings.indexOf(node) + 1);

      const staticProperties = nextSiblings.filter(it => {
        return it.type === 'ExpressionStatement' &&
        it.expression.type === 'AssignmentExpression' &&
        it.expression.operator === '=' &&
        it.expression.left.object.name === node.id.name
      });

      const has$injectStaticProperty = staticProperties.some(it => it.expression.left.property.name === '$inject');

      if (!has$injectStaticProperty) {
        let functionExpression = getFunctionExpressionFromConstructor(func);
        annotateFunctionImpl(functionExpression, original);
      }
    }

    if (func.isIdentifier()) {
      let declarator = findRootDeclarator(func);
      if (declarator) {
        if (declarator.isVariableDeclarator()) {
          annotateFunctionImpl(declarator.get('init'), original);
        } else {
          annotateFunctionImpl(declarator, original);
        }
      }
    }
  }

  function eachObjectProperty(objectOrIdentifier, callback) {
    let object;

    if (objectOrIdentifier.isObjectExpression()) {
      object = objectOrIdentifier;
    }

    if (!object) {
      let declarator = findRootDeclarator(objectOrIdentifier);
      if (declarator && declarator.get('init').isObjectExpression()) {
        object = declarator.get('init');
      }
    }

    if (object) {
      let properties = object.get('properties');
      for (let i = 0; i < properties.length; i++) {
        let property = properties[i];
        callback(property);
      }
    }
  }

  function annotateFunction(path) {
    return annotateFunctionImpl(path, path);
  }

  function annotateObjectProperties(object) {
    if (!object.isObjectExpression()) { return; }
    let properties = object.get('properties');
    for (let i = 0; i < properties.length; i++) {
      let property = properties[i];
      annotateFunction(property.get('value'));
    }
  }

  function last(array) {
    return array[array.length-1];
  }

  function annotateModuleConfigFunction(path) {
    let moduleLastArg = last(path.parentPath.get('arguments'));
    annotateFunction(moduleLastArg);
    moduleLastArg.traverse(configVisitor);
    moduleLastArg.stop();
  }

  function annotateModuleType(annotationCandidate) {
    let match = TYPES.test(getTypeName(annotationCandidate));

    if (match) {
      let candidate = last(annotationCandidate.get('arguments'));

      annotateFunction(candidate);

      switch (getTypeName(annotationCandidate)) {
      case 'provider':
        candidate.traverse(providerGetVisitor);
        break;
      case 'directive':
      case 'component':
        candidate.traverse(directiveControllerVisitor);
        break;
      case 'config':
        candidate.traverse(configVisitor);
        break;
      }

      candidate.traverse(defaultVisitor);
      candidate.stop();
    }
  }

  return {
    visitor: {
      Program(path, { opts }) {
        configuration = Array.isArray(opts) ? opts : [];
      },
      CallExpression(path) {
        if (isAngularModule(path)) {
          annotateModuleType(path);
        }
      }
    }
  };
}
