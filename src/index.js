export default function ({ Plugin, types: t }) {
  const TYPES = /(controller|config|service|filter|animation|provider|directive|factory|run)/;

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
            eachObjectPropery(paramPath, property => { // eslint-disable-line no-loop-func
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
    MemberExpression() {
      annotateUsingConfiguration(this);
    }
  };

  let configVisitor = {
    MemberExpression() {
      annotateUsingConfiguration(this);
      annotateProvide(this);
    }
  };

  let directiveControllerVisitor = {
    Property() {
      if (this.get('key').isIdentifier({ name: 'controller' })) {
        annotateFunction(this.get('value'));
        this.stop();
      }
    }
  };

  let providerGetVisitor = {
    ExpressionStatement() {
      if (this.get('expression.left').matchesPattern('this.$get')) {
        annotateFunction(this.get('expression.right'));
        this.stop();
      }
    }
  };

  function isAngularModule(path) {
    if (path.isMemberExpression()) {
      if (path.matchesPattern('angular.module')) {
        annotateModuleConfigFunction(path);
        return true;
      }
      let object = path.get('object');
      let declarator = findRootDeclarator(object);
      if (declarator && declarator.get('init').isCallExpression() && declarator.get('init.callee.object').isCallExpression()) {
        return declarator.get('init.callee.object.callee').matchesPattern('angular.module');
      }
      if (object.isCallExpression()) {
        return isAngularModule(object.get('callee'));
      }
    }
    return false;
  }

  function getTypeName(path) {
    return path.node.callee.property.name;
  }

  function getFunctionExpressionFromConstructor(classPath) {
    let functionExpression;
    let visitor = {
      MethodDefinition() {
        if (this.node.kind === 'constructor') {
          functionExpression = this.get('value');
          this.stop();
        }
      }
    };
    classPath.traverse(visitor);
    return functionExpression;
  }

  function isAnnotationCandidate(path) {
    return path.isCallExpression() && TYPES.test(getTypeName(path));
  }

  function annotateFunctionImpl(func, original) {
    if (!func) { return; }

    if (func.isFunction()) {
      let varLiterals = func.node.params.map(i => t.literal(i.name));
      varLiterals.push(original.node);
      original.replaceWith(
        t.arrayExpression(varLiterals)
      );
    }

    if (func.isClassDeclaration()) {
      let functionExpression = getFunctionExpressionFromConstructor(func);
      annotateFunctionImpl(functionExpression, original);
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

  function eachObjectPropery(objectOrIdentifier, callback) {
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

  function annotateModuleType(memberExprPath) {
    let annotationCandidate = memberExprPath.findParent(isAnnotationCandidate);
    if (annotationCandidate) {
      let candidate = last(annotationCandidate.get('arguments'));

      annotateFunction(candidate);

      switch (getTypeName(annotationCandidate)) {
      case 'provider':
        candidate.traverse(providerGetVisitor);
        break;
      case 'directive':
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

  return new Plugin('angular-annotate', {
    visitor: {
      Program: {
        enter(node, parent, scope, file) {
          configuration = file.opts && file.opts.extra && file.opts.extra['angular-annotate'];
          configuration = configuration || [];
        }
      },
      MemberExpression() {
        if (isAngularModule(this)) {
          annotateModuleType(this);
        }
      }
    }
  });
}
