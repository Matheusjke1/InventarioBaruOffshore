import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import { Picker } from '@react-native-picker/picker'; // Importação do Picker atualizado

// Inicializa o banco de dados SQLite
const db = SQLite.openDatabase(
  { name: 'inventarioBaru.db', location: 'default' },
  () => { console.log('Banco de dados aberto'); },
  (err) => { console.log('Erro ao abrir o banco de dados: ', err); }
);

const CadastroUsuariosScreen = () => {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [centroCusto, setCentroCusto] = useState('');
  const [embarcacao, setEmbarcacao] = useState('Não');
  const [matriculaIMO, setMatriculaIMO] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Controle de carregamento

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS Usuarios (userID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, userTipo TEXT, userNome TEXT, userCC TEXT, userMatricula INTEGER, userIMO INTEGER);',
        [],
        () => { console.log('Tabela Usuarios criada com sucesso!'); },
        (err) => { console.log('Erro ao criar a tabela Usuarios: ', err); }
      );
    });
  }, []);

  const handleSave = () => {
    if (!nomeCompleto || !centroCusto || (embarcacao === 'Sim' && !matriculaIMO)) {
      Alert.alert('Erro', 'Todos os campos devem ser preenchidos');
      return;
    }
  
    const userTipo = embarcacao === 'Sim' ? 'embarcacao' : 'funcionario';
    // Atribui null ou um número dependendo do tipo de embarcação
    const matricula = embarcacao === 'Sim' ? null : (matriculaIMO ? parseInt(matriculaIMO) : null);
    const imo = embarcacao === 'Sim' ? (matriculaIMO ? parseInt(matriculaIMO) : null) : null;
  
    setIsLoading(true);
  
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO Usuarios (userTipo, userNome, userCC, userMatricula, userIMO) VALUES (?, ?, ?, ?, ?)',
        [userTipo, nomeCompleto, centroCusto, matricula, imo],
        (tx, result) => {
          Alert.alert('Sucesso', 'Usuário cadastrado com sucesso');
          setNomeCompleto('');
          setCentroCusto('');
          setEmbarcacao('Não');
          setMatriculaIMO('');
          setIsLoading(false);
        },
        (err) => {
          console.log('Erro ao salvar usuário:', err);
          Alert.alert('Erro', 'Não foi possível salvar o usuário');
          setIsLoading(false);
        }
      );
    });
  };

  return (
    <ImageBackground 
      source={require('./src/img/fundo.png')} // Defina o caminho para sua imagem de fundo
      style={styles.container}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Cadastro de Usuários</Text>

        <Text style={styles.label}>Nome Completo</Text>
        <TextInput
          style={styles.input}
          value={nomeCompleto}
          onChangeText={setNomeCompleto}
        />

        <Text style={styles.label}>Centro de Custo</Text>
        <TextInput
          style={styles.input}
          value={centroCusto}
          onChangeText={setCentroCusto}
        />

        <Text style={styles.label}>Embarcação</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={embarcacao}
            style={styles.picker}
            onValueChange={(itemValue) => setEmbarcacao(itemValue)}
          >
            <Picker.Item label="Sim" value="Sim" />
            <Picker.Item label="Não" value="Não" />
          </Picker>
        </View>

        {/* Campo dinâmico baseado no valor de embarcacao */}
        <Text style={styles.label}>{embarcacao === 'Sim' ? 'IMO' : 'Matrícula'}</Text>
        <TextInput
          style={styles.input}
          value={matriculaIMO}
          onChangeText={setMatriculaIMO}
          placeholder={embarcacao === 'Sim' ? 'IMO' : 'Matrícula'}
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Cadastrando...' : 'Salvar Usuário'}
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Remove qualquer cor de fundo padrão
  },
  overlay: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Transparência para a camada superior
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderColor: '#ddd', // Borda visível para o Picker
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Cor de fundo esmaecida
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: 'transparent', // Deixe o fundo do Picker transparente
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default CadastroUsuariosScreen;
