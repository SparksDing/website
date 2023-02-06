const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('database.db')

db.serialize(() => {
  const sql = `
      CREATE TABLE IF NOT EXISTS users
      (id integer primary key, username TEXT unique, password_hash TEXT)
  `;
  db.run(sql);
  const sql_faq = `
      CREATE TABLE IF NOT EXISTS freq_ask_questions
      (id integer primary key, question TEXT unique, answer TEXT)
  `;
  db.run(sql_faq);
});


class Crud {

  static create_table() {
    db.run("CREATE TABLE...", function(error){
      if(error){
      // Query could not be executed.
      }else{
      // Query successfully executed.
      }
    })
  }


  static save_hashed_password(username, passwd, cb) {
    const sql = `INSERT INTO users(username, password_hash) values(?, ?)`

    db.run(sql, username, passwd, cb)
  }

  static add_faq(question, answer, cb) {
    const sql = `INSERT INTO freq_ask_questions(question, answer) values(?, ?)`
    db.run(sql, question, answer, cb)
  }

  static add_blog(title, content, cb) {
    const sql = `INSERT INTO articles(title, content, createTime) values(?, ?, ?)`

    db.run(sql, title, content, new Date(), cb)
  }

  static get_hashed_by_name(username, cb) {
    const query = "SELECT * FROM users WHERE username = ?"
    db.get(query, username, cb)

  }




}


module.exports.CrudAPI = Crud;