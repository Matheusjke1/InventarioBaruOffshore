import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList, ImageBackground } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import { Picker } from '@react-native-picker/picker';

// Inicializa o banco de dados SQLite
const db = SQLite.openDatabase(
  { name: 'inventarioBaru.db', location: 'default' },
  () => { console.log('Banco de dados aberto'); },
  (err) => { console.log('Erro ao abrir o banco de dados: ', err); }
);

// Função para formatar o CNPJ
const formatCNPJ = (cnpj) => {
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

const CadastroFornecedoresScreen = () => {
  const [nomeFornecedora, setNomeFornecedora] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [contratoAtivo, setContratoAtivo] = useState('Sim');
  const [fornecedores, setFornecedores] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Controle de carregamento
  const [editingFornecedor, setEditingFornecedor] = useState(null); // Controle de edição

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Fornecedor (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome_fornecedora TEXT,
          cnpj TEXT,
          contrato_ativo TEXT
        )`,
        [],
        () => { console.log('Tabela Fornecedor criada com sucesso!'); },
        (err) => { console.log('Erro ao criar a tabela Fornecedor: ', err); }
      );
    });
    loadFornecedores();
  }, []);

  const loadFornecedores = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM Fornecedor',
        [],
        (tx, results) => {
          const fornecedoresData = [];
          for (let i = 0; i < results.rows.length; i++) {
            fornecedoresData.push(results.rows.item(i));
          }
          setFornecedores(fornecedoresData);
        },
        (err) => { console.log('Erro ao carregar fornecedores: ', err); }
      );
    });
  };

  const handleSave = () => {
    if (!nomeFornecedora || !cnpj || !contratoAtivo) {
      Alert.alert('Erro', 'Todos os campos devem ser preenchidos');
      return;
    }

    const cnpjNum = cnpj.replace(/\D/g, '');

    if (cnpjNum.length !== 14) {
      Alert.alert('Erro', 'CNPJ inválido');
      return;
    }

    setIsLoading(true);

    if (editingFornecedor) {
      db.transaction((tx) => {
        tx.executeSql(
          'UPDATE Fornecedor SET nome_fornecedora = ?, cnpj = ?, contrato_ativo = ? WHERE id = ?',
          [nomeFornecedora, cnpjNum, contratoAtivo, editingFornecedor.id],
          (tx, result) => {
            Alert.alert('Sucesso', 'Fornecedor atualizado com sucesso');
            setNomeFornecedora('');
            setCnpj('');
            setContratoAtivo('Sim');
            setEditingFornecedor(null);
            loadFornecedores();
            setIsLoading(false);
          },
          (err) => {
            Alert.alert('Erro', 'Não foi possível atualizar o fornecedor');
            setIsLoading(false);
          }
        );
      });
    } else {
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO Fornecedor (nome_fornecedora, cnpj, contrato_ativo) VALUES (?, ?, ?)',
          [nomeFornecedora, cnpjNum, contratoAtivo],
          (tx, result) => {
            Alert.alert('Sucesso', 'Fornecedor cadastrado com sucesso');
            setNomeFornecedora('');
            setCnpj('');
            setContratoAtivo('Sim');
            loadFornecedores();
            setIsLoading(false);
          },
          (err) => {
            Alert.alert('Erro', 'Não foi possível salvar o fornecedor');
            setIsLoading(false);
          }
        );
      });
    }
  };

  const handleEdit = (fornecedor) => {
    setEditingFornecedor(fornecedor);
    setNomeFornecedora(fornecedor.nome_fornecedora);
    setCnpj(fornecedor.cnpj);
    setContratoAtivo(fornecedor.contrato_ativo);
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemTextContainer}>
        <Text style={styles.listItemText}>Nome: {item.nome_fornecedora}</Text>
        <Text style={styles.listItemText}>CNPJ: {formatCNPJ(item.cnpj)}</Text>
        <Text style={styles.listItemText}>Contrato Ativo: {item.contrato_ativo}</Text>
      </View>
      <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editIcon}>
        <Text style={styles.editText}>Editar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground source={require('./src/img/fundo.png')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Cadastro de Fornecedores</Text>

        <Text style={styles.label}>Nome da Fornecedora</Text>
        <TextInput
          style={styles.input}
          value={nomeFornecedora}
          onChangeText={setNomeFornecedora}
        />

        <Text style={styles.label}>CNPJ (Somente números)</Text>
        <TextInput
          style={styles.input}
          value={cnpj}
          onChangeText={(text) => setCnpj(text.replace(/\D/g, ''))}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Contrato Ativo</Text>
        <Picker
          selectedValue={contratoAtivo}
          style={styles.picker}
          onValueChange={(itemValue) => setContratoAtivo(itemValue)}
        >
          <Picker.Item label="Sim" value="Sim" />
          <Picker.Item label="Não" value="Não" />
        </Picker>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleSave} 
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Cadastrando...' : editingFornecedor ? 'Atualizar Fornecedor' : 'Salvar Fornecedor'}
          </Text>
        </TouchableOpacity>

        <FlatList
          data={fornecedores}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover', // Ajusta a imagem ao tamanho da tela
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Semitransparente para permitir que a imagem de fundo seja visível
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000', // Alterado para preto
    textAlign: 'center', // Centraliza o título
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000', // Alterado para preto
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
  picker: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#A9A9A9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  list: {
    marginTop: 20,
  },
  listItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemTextContainer: {
    flex: 1,
  },
  listItemText: {
    fontSize: 14,
    color: '#000', // Alterado para preto
  },
  editIcon: {
    padding: 5,
  },
  editText: {
    color: '#007BFF',
    fontSize: 14,
  },
});

export default CadastroFornecedoresScreen;
