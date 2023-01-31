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
  const sql_article = `
      CREATE TABLE IF NOT EXISTS articles
      (id integer primary key, title TEXT unique, content TEXT, createTime DATETIME not null)
  `;
  db.run(sql_article);
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

  static get_blog_all(cb) {
    const query = "SELECT * FROM articles"
    db.all(query, cb)
  }

  static get_blog_like(title, cb) {
    const query = "SELECT * FROM articles WHERE title LIKE ?"
    db.all(query, title, cb)
  }

  static get_faq_like(question, cb) {
    const query = "SELECT * FROM freq_ask_questions WHERE question LIKE ?"
    db.all(query, question, cb)
  }


  static get_blog(id, cb) {
    db.get('SELECT * FROM articles WHERE id = ?', id, cb);
  }

  static add_blog(title, content, cb) {
    const sql = `INSERT INTO articles(title, content, createTime) values(?, ?, ?)`

    db.run(sql, title, content, new Date(), cb)
  }

  // static delete_blog(id, cb) {
  //   const query = "DELETE FROM articles WHERE id = ?"
  //   db.run(query, [id], cb)
  // }

  static delete_faq(id) {
    const query = "DELETE FROM freq_ask_questions WHERE id = ?"
    db.run(query, [id], function(error){
      if(error){

      } else{

      }
    })
  
  }

  static update_faq(answer, id) {
    const query = "UPDATE freq_ask_questions SET answer = ? WHERE id = ?"
    db.run(query, answer, id, function(error){
      if(error){

      } else{

      }
    })
  
  }

  static delete_blog(id) {
    const query = "DELETE FROM articles WHERE id = ?"
    db.run(query, [id], function(error){
      if(error){

      } else{

      }
    })
  }

  static get_faq_all(cb) {
    const query = "SELECT * FROM freq_ask_questions"
    db.all(query, cb)
  }

  static get_hashed_by_name(username, cb) {
    const query = "SELECT * FROM users WHERE username = ?"
    db.get(query, username, cb)

  }


  static get_all() {
    const maxAge = 18
    const query = "SELECT * FROM Humans WHERE Age < ?"
    db.all(query, [maxAge], function(error, humans){
    /*
    humans = [
    {Id: 1, Name: "Alice", Age: 10},
    ...
    ]
    */
    })
  }

  static update_row() {
    const id = 1
    const newName = "Alicia"
    const query = "UPDATE Humans SET Name = ? WHERE id = ?"
    db.run(query, [newName, id], function(error){
      if(error){
      // ...
      }else{
      const numberOfUpdatedRows = this.changes
      }
    })
  }


  static delete_record() {
    const id = 1
    const query = "DELETE FROM Humans WHERE id = ?"
      db.run(query, [id], function(error){
      if(error){
      // ...
      }else{
      const numberOfDeletedRows = this.changes
      }
    })
  }

}


module.exports.CrudAPI = Crud;