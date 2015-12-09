export default function ({ Plugin, types: t }) {
  const TYPES = /(controller|config|service|filter|animation|provider|directive|factory|run)/;

  function findRootDeclarator(path) {
    if (path.isIdentifier()) {
      let binding = path.scope.getBinding(path.node.name);

      if (binding) {
        if (binding.path.isVariableDeclarator()) {
          if (binding.path.get('init').isIdentifier()) {
            return findRootDeclarator(binding.path.get('init'));
          } else {
            return binding.path;
          }
        }

        if (binding.path.isFunctionDeclaration()) {
          return binding.path;
        }

        if (binding.path.isClassDeclaration()) {
          return binding.path;
        }
      }
    }
  }

  function isAngularModule(path) {
    if (path.isMemberExpression()) {
      if (path.matchesPattern('angular.module')) {
        return true;
      }
      let object = path.get('object');
      let declarator = findRootDeclarator(object);
      if (declarator && declarator.get('init').isCallExpression()) {
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

    if (func.isFunctionExpression() || func.isFunctionDeclaration()) {
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
  }

  let directiveControllerVisitor = {
    Property() {
      if (this.get('key').isIdentifier({ name: 'controller' })) {
        annotateFunction(this.get('value'));
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

  return new Plugin('angular-annotate', {
    visitor: {
      MemberExpression() {
        if (isAngularModule(this)) {
          annotateModuleConfigFunction(this);
          let annotationCandidate = this.findParent(isAnnotationCandidate);
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
            }
          }
        }

        if (this.matchesPattern('$injector.invoke')) {
          let func = last(this.parentPath.get('arguments'));
          annotateFunction(func);
        }

        // TODO this should likely be a plugin stuff
        if (this.matchesPattern('$routeProvider.when')) {
          let routeConfig = last(this.parentPath.get('arguments'));
          let declarator = findRootDeclarator(routeConfig);
          if (declarator.get('init').isObjectExpression()) {
            let properties = declarator.get('init.properties');
            for (let i = 0; i < properties.length; i++) {
              let property = properties[i];
              if (property.get('key').isIdentifier({ name: 'resolve' })) {
                annotateObjectProperties(property.get('value'));
              }
            }
          }
        }
      }
    }
  });
}
