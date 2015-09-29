export default function ({ Plugin, types: t }) {
  function annotateFunction(func) {
    let varLiterals = func.node.params.map(i => t.literal(i.name));
    varLiterals.push(func.node);
    func.replaceWith(
      t.arrayExpression(varLiterals)
    );
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
      CallExpression() {
        if (this.get('callee').get('object').get('callee').matchesPattern('angular.module')) {
          if (this.get('callee').get('property').isIdentifier({ name: 'controller' })) {
            let func = this.get('arguments')[1];
            annotateFunction(func);
          } else if (this.get('callee').get('property').isIdentifier({ name: 'config' })) {
            let func = this.get('arguments')[0];
            annotateFunction(func);
          } else if (this.get('callee').get('property').isIdentifier({ name: 'service' })) {
            let func = this.get('arguments')[1];
            annotateFunction(func);
          } else if (this.get('callee').get('property').isIdentifier({ name: 'filter' })) {
            let func = this.get('arguments')[1];
            annotateFunction(func);
          } else if (this.get('callee').get('property').isIdentifier({ name: 'provider' })) {
            let func = this.get('arguments')[1];
            annotateFunction(func);
            func.traverse(providerGetVisitor);
            this.skip();
          } else if (this.get('callee').get('property').isIdentifier({ name: 'directive' })) {
            let func = this.get('arguments')[1];
            annotateFunction(func);
            func.traverse(directiveControllerVisitor);
            this.skip();
          }
        }
      }
    }
  });
}
