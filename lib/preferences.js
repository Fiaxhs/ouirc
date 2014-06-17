var db = openDatabase('prefs', '1.0', 'ouirc preferences', 2 * 1024 * 1024);
db.transaction(function (tx) {
  tx.executeSql('CREATE TABLE IF NOT EXISTS prefs (name unique, value)');
});

exports.getServersList = function () {
  db.transaction(function () {
    tx.executeSql("SELECT * FROM prefs WHERE name = ", [], function (tx, results) {
      var len = results.rows.length, i;
      for (i = 0; i < len; i++) {
        alert(results.rows.item(i).text);
      }
    });
  });
}