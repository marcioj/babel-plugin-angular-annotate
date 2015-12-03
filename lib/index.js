export default function ({ Plugin, types: t }) {
  const TYPES = /(controller|config|service|filter|animation|provider|directive|factory|run)/;

  function findRootDeclarator(path) {
    if (path.isIdentifier()) {
      let binding = path.scope.getBinding(path.node.name);
      // TODO handle more than one assigment. Ex:
      // var a = 1; var b = a; var c = b; should return the variable declarator for a
      if (binding && binding.path.isVariableDeclarator()) {
        return binding.path;
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

  function isAnnotationCandidate(path) {
    return path.isCallExpression() && TYPES.test(getTypeName(path));
  }

  function getTypeName(path) {
    return path.node.callee.property.name;
  }

  function annotateFunction(func) {
    if (!func || !func.isFunctionExpression()) { return; }
    let varLiterals = func.node.params.map(i => t.literal(i.name));
    varLiterals.push(func.node);
    func.replaceWith(
      t.arrayExpression(varLiterals)
    );
  }

  function annotateObjectProperties(object) {
    if (!object.isObjectExpression()) { return; }
    let properties = object.get('properties');
    for (let i = 0; i < properties.length; i++) {
      let property = properties[i];
      annotateFunction(property.get('value'));
    }
  }

  function annotateModuleConfigFunction(path) {
    let moduleLastArg = last(path.parentPath.get('arguments'));
    annotateFunction(moduleLastArg);
  }

  function last(array) {
    return array[array.length-1];
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
            let func = last(annotationCandidate.get('arguments'));
            annotateFunction(func);
            switch (getTypeName(annotationCandidate)) {
            case 'provider':
              func.traverse(providerGetVisitor);
              this.skip();
              break;
            case 'directive':
              func.traverse(directiveControllerVisitor);
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
