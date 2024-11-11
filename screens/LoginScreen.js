import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import CryptoJS from 'crypto-js';
import SQLite from 'react-native-sqlite-storage';

// Abrir o banco de dados SQLite
const db = SQLite.openDatabase(
  { name: 'inventarioBaru.db', location: 'default' },
  () => { console.log('Banco de dados aberto'); },
  (err) => { console.log('Erro ao abrir o banco de dados: ', err); }
);

const LoginScreen = ({ navigation }) => {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');

  // Função para verificar login e senha
  const handleLogin = async () => {
    if (login && senha) {
      try {
        console.log('Tentando logar com:', login);

        db.transaction((tx) => {
          tx.executeSql(
            'SELECT * FROM Logins WHERE email = ?',
            [login],
            (tx, results) => {
              console.log('Resultados da consulta:', results.rows.length);

              if (results.rows.length > 0) {
                const storedHash = results.rows.item(0).password_hash;
                const enteredHash = CryptoJS.SHA256(senha).toString(CryptoJS.enc.Base64);

                console.log('Hash armazenado:', storedHash);
                console.log('Hash inserido:', enteredHash);

                if (enteredHash === storedHash) {
                  navigation.replace('MenuScreen'); // Navega para a tela MenuScreen
                } else {
                  Alert.alert('Erro', 'Senha incorreta.');
                }
              } else {
                Alert.alert('Erro', 'Usuário não encontrado.');
              }
            },
            (err) => {
              console.error('Erro ao consultar o banco de dados: ', err);
              Alert.alert('Erro', 'Falha na consulta de login.');
            }
          );
        });

      } catch (error) {
        console.error('Erro ao realizar login:', error);
        Alert.alert('Erro', 'Falha na consulta de login.');
      }
    } else {
      Alert.alert('Atenção', 'Por favor, insira login e senha.');
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUpScreen');  // Navega para a tela de criação de conta
  };

  const handleResetPassword = () => {
    navigation.navigate('ResetSenhaScreen');  // Navega para a tela de redefinição de senha
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('./src/img/logo_baruoffshore.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <TextInput
        style={styles.input}
        placeholder="Login"
        value={login}
        onChangeText={setLogin}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={handleResetPassword}>
          <Text style={styles.forgotPassword}>Esqueceu sua senha?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Conectar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signupContainer} onPress={handleSignUp}>
        <Text style={styles.signupText}>Criar uma nova conta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f5f5f5' 
  },
  logo: { 
    width: '50%', 
    height: undefined, 
    aspectRatio: 1, 
    marginBottom: 20 
  },
  input: { 
    width: '100%', 
    padding: 15, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 10, 
    backgroundColor: '#fff' 
  },
  actionsContainer: { 
    width: '100%', 
    alignItems: 'flex-start', 
    marginBottom: 20
  },
  forgotPassword: { 
    color: '#007BFF', 
    marginBottom: 10, 
    textAlign: 'left' 
  },
  loginButton: { 
    backgroundColor: '#007BFF', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    width: '100%' 
  },
  loginButtonText: { 
    color: '#fff', 
    fontSize: 16 
  },
  signupContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10 
  },
  signupText: { 
    color: '#007BFF', 
    marginLeft: 5 
  }
});

export default LoginScreen;
