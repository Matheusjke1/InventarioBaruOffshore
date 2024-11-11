import SQLite from 'react-native-sqlite-storage';
import CryptoJS from 'react-native-crypto-js';

// Abrir o banco de dados SQLite
const db = SQLite.openDatabase(
  { name: 'inventarioBaru.db', location: 'default' },
  () => { console.log('Banco de dados aberto'); },
  (err) => { console.log('Erro ao abrir o banco de dados: ', err); }
);

// Função para autenticar o usuário
export const authenticateUser = (email, password) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM Logins WHERE email = ?',
        [email],
        (tx, results) => {
          if (results.rows.length > 0) {
            const storedHash = results.rows.item(0).password_hash;
            resolve(storedHash);  // Retorna o hash da senha armazenada para comparação
          } else {
            reject('Usuário não encontrado.');
          }
        },
        (err) => {
          reject(err);
        }
      );
    });
  });
};
