import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import CryptoJS from 'crypto-js'; // Mudança para o crypto-js

// Abre o banco de dados
const db = SQLite.openDatabase(
  { name: 'inventarioBaru.db', location: 'default' },
  () => {},
  error => {
    console.log(error);
  }
);

const SignUpScreen = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const handleSignUp = () => {
    if (!nome || !email || !senha || !confirmarSenha) {
      Alert.alert('Erro', 'Todos os campos devem ser preenchidos');
      return;
    }

    // Verifica se a senha e a confirmação são iguais
    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    // Validação da senha (mínimo de 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial)
    const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!senhaRegex.test(senha)) {
      Alert.alert(
        'Erro',
        'A senha deve ter no mínimo 8 caracteres, 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial.'
      );
      return;
    }

    // Gerar o hash da senha
    const passwordHash = CryptoJS.SHA256(senha).toString(CryptoJS.enc.Base64);

    // Inserir dados no banco de dados SQLite
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO Logins (nome, email, password_hash) VALUES (?, ?, ?)',
        [nome, email, passwordHash],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            setTimeout(() => {
              Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
              navigation.navigate('LoginScreen'); // Volta para a tela de login após cadastro
            }, 100);
          } else {
            Alert.alert('Erro', 'Falha ao cadastrar usuário.');
          }
        },
        error => {
          console.log('Erro ao inserir dados', error);
          Alert.alert('Erro', 'Falha ao cadastrar usuário.');
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Cadastro de Usuário</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmar Senha"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry
        />

        <Text style={styles.passwordRequirements}>
          A senha deve ter no mínimo:
          {'\n'}• 8 caracteres
          {'\n'}• 1 letra maiúscula
          {'\n'}• 1 letra minúscula
          {'\n'}• 1 número
          {'\n'}• 1 caractere especial (!@#$%^&*)
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.linkText}>Já tem uma conta? Faça login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
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
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    width: '100%',
  },
  passwordRequirements: {
    fontSize: 14,
    color: '#555',
    marginTop: 10,
    textAlign: 'left',
    width: '100%',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  linkText: {
    color: '#007BFF',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default SignUpScreen;
