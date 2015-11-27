export default function ({ Plugin, types: t }) {
  const TYPES = /(controller|config|service|filter|animation|provider|directive|factory|run)/;

  function isAngularModule(path) {
    if (path.isMemberExpression()) {
      if (path.matchesPattern('angular.module')) {
        return true;
      }
      var object = path.get('object');
      if (object.isIdentifier()) {
        var binding = object.scope.getBinding(object.node.name);
        if (binding && binding.path.isVariableDeclarator() && binding.path.get('init').isCallExpression()) {
          return binding.path.get('init.callee.object.callee').matchesPattern('angular.module');
        }
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

  function annotateModuleConfigFunction(path) {
    let moduleLastArg = last(path.parentPath.get('arguments'));
    annotateFunction(moduleLastArg);
  }

  function last(array) {
    return array[array.length-1];
  }

  var directiveControllerVisitor = {
    Property() {
      if (this.get('key').isIdentifier({ name: 'controller' })) {
        annotateFunction(this.get('value'));
      }
    }
  };

  var providerGetVisitor = {
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
      }
    }
  });
}
