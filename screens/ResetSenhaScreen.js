import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import CryptoJS from 'crypto-js';

// Abrir o banco de dados SQLite
const db = SQLite.openDatabase(
  { name: 'inventarioBaru.db', location: 'default' },
  () => { console.log('Banco de dados aberto'); },
  (err) => { console.log('Erro ao abrir o banco de dados: ', err); }
);

function ResetSenhaScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');

  const handleResetPassword = () => {
    if (email && novaSenha && confirmaSenha) {
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      if (!regex.test(novaSenha)) {
        Alert.alert('Erro', 'A senha deve ter no mínimo 8 caracteres, 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial.');
        return;
      }

      const novaSenhaHash = CryptoJS.SHA256(novaSenha).toString(CryptoJS.enc.Base64);
      const confirmaSenhaHash = CryptoJS.SHA256(confirmaSenha).toString(CryptoJS.enc.Base64);

      if (novaSenhaHash !== confirmaSenhaHash) {
        Alert.alert('Erro', 'As senhas não coincidem.');
        return;
      }

      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM Logins WHERE email = ?',
          [email],
          (tx, results) => {
            if (results.rows.length > 0) {
              tx.executeSql(
                'UPDATE Logins SET password_hash = ? WHERE email = ?',
                [novaSenhaHash, email],
                (tx, results) => {
                  if (results.rowsAffected > 0) {
                    Alert.alert('Sucesso', 'Senha alterada com sucesso!');
                    navigation.navigate('LoginScreen'); // Redireciona para a tela de login
                  } else {
                    Alert.alert('Erro', 'Falha ao alterar a senha.');
                  }
                },
                (err) => {
                  console.error('Erro ao atualizar a senha:', err);
                  Alert.alert('Erro', 'Falha ao atualizar a senha no banco de dados.');
                }
              );
            } else {
              Alert.alert('Erro', 'E-mail não encontrado.');
            }
          },
          (err) => {
            console.error('Erro ao consultar o banco de dados: ', err);
            Alert.alert('Erro', 'Falha ao buscar e-mail no banco de dados.');
          }
        );
      });
    } else {
      Alert.alert('Atenção', 'Por favor, insira um e-mail e as senhas.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Esqueci a Senha</Text>
        <Text style={styles.instructions}>Digite seu e-mail e a nova senha.</Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={setEmail}
          value={email}
        />

        <TextInput
          style={styles.input}
          placeholder="Nova Senha"
          placeholderTextColor="#888"
          secureTextEntry
          onChangeText={setNovaSenha}
          value={novaSenha}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirme a Nova Senha"
          placeholderTextColor="#888"
          secureTextEntry
          onChangeText={setConfirmaSenha}
          value={confirmaSenha}
        />

        <Text style={styles.passwordRequirements}>
          A senha deve ter no mínimo:
          {'\n'}• 8 caracteres
          {'\n'}• 1 letra maiúscula
          {'\n'}• 1 letra minúscula
          {'\n'}• 1 número
          {'\n'}• 1 caractere especial (!@#$%^&*)
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Alterar Senha</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.backToLogin}>Voltar ao Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400, 
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  passwordRequirements: {
    fontSize: 14,
    color: '#555',
    marginTop: 10,
    textAlign: 'left',
    width: '100%',
  },
  button: {
    width: '100%',
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backToLogin: {
    fontSize: 14,
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default ResetSenhaScreen;
