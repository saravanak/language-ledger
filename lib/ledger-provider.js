var Ledger = require('ledger-cli').Ledger;

var ledgerEntities = (entityName, journalPath, callback) => {
  var ledger = new Ledger({
    binary: atom.config.get('language-ledger.ledgerBinary'),
    file: journalPath,
  });
  var accounts = [];
  var err = null
  var entityProvider = ledger[entityName];
  if(!entityProvider) {
    return callback(`No entity ${entityName} on ledger API`);
  }
  return entityProvider.call(ledger)
    .on('data', (account) => {
      console.log(account);
      accounts.push(account);
    })
    .once('error', (err) => callback(String(err), accounts))
    .once('end', () => callback(null, accounts))
}

var hasScope = (scopesArray, scope) => {
  return scopesArray.indexOf(scope) != -1;
};

module.exports = {
  selector: '.source.ledger',

  filterSuggestions: true,

  getSuggestions: ({editor, scopeDescriptor}) =>  {

    var matchingScope = ['string.account', 'string.payee'].find(scope =>
      hasScope(scopeDescriptor.getScopesArray(), scope)
    );

    if(!matchingScope) {
      return null;
    }

    return new Promise((resolve) => {
      const entityName = matchingScope.replace('string.', '');
      ledgerEntities(`${entityName}s`, editor.getPath(), (err, suggestions) => {
        if(err == null) {
          console.log(suggestions);
          resolve(suggestions.map(suggestion => { return {text: suggestion}; }));
        }
      })
    });
  },


}
