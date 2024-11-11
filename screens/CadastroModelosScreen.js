import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList, ImageBackground } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import { Picker } from '@react-native-picker/picker'; // Para a combobox de seleção

// Inicializa o banco de dados SQLite
const db = SQLite.openDatabase(
  { name: 'inventarioBaru.db', location: 'default' },
  () => { console.log('Banco de dados aberto'); },
  (err) => { console.log('Erro ao abrir o banco de dados: ', err); }
);

const CadastroModelosScreen = () => {
  const [nomeModelo, setNomeModelo] = useState('');
  const [tipoAtivo, setTipoAtivo] = useState('Notebook');
  const [modelos, setModelos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingModelo, setEditingModelo] = useState(null);

  // Cria a tabela ModeloAtivo caso ela não exista
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS ModeloAtivo (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome_modelo TEXT,
          Tipo TEXT
        )`,
        [],
        () => { console.log('Tabela ModeloAtivo criada com sucesso!'); },
        (err) => { console.log('Erro ao criar a tabela ModeloAtivo: ', err); }
      );
    });

    // Carrega os modelos já cadastrados
    loadModelos();
  }, []);

  const loadModelos = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM ModeloAtivo',
        [],
        (tx, results) => {
          const modelosData = [];
          for (let i = 0; i < results.rows.length; i++) {
            modelosData.push(results.rows.item(i));
          }
          setModelos(modelosData);
        },
        (err) => { console.log('Erro ao carregar modelos: ', err); }
      );
    });
  };

  const handleSave = () => {
    // Valida se os campos estão preenchidos
    if (!nomeModelo || !tipoAtivo) {
      Alert.alert('Erro', 'Todos os campos devem ser preenchidos');
      return;
    }

    setIsLoading(true);

    if (editingModelo) {
      // Atualiza o modelo
      db.transaction((tx) => {
        tx.executeSql(
          'UPDATE ModeloAtivo SET nome_modelo = ?, Tipo = ? WHERE id = ?',
          [nomeModelo, tipoAtivo, editingModelo.id],
          (tx, result) => {
            console.log('Modelo atualizado com sucesso!', result);
            Alert.alert('Sucesso', 'Modelo atualizado com sucesso');
            setNomeModelo('');
            setTipoAtivo('Notebook');
            setEditingModelo(null);
            loadModelos();
            setIsLoading(false);
          },
          (err) => {
            console.log('Erro ao atualizar modelo: ', err);
            Alert.alert('Erro', 'Não foi possível atualizar o modelo');
            setIsLoading(false);
          }
        );
      });
    } else {
      // Realiza a inserção no banco de dados
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO ModeloAtivo (nome_modelo, Tipo) VALUES (?, ?)',
          [nomeModelo, tipoAtivo],
          (tx, result) => {
            console.log('Modelo salvo com sucesso!', result);
            Alert.alert('Sucesso', 'Modelo cadastrado com sucesso');
            setNomeModelo('');
            setTipoAtivo('Notebook');
            loadModelos();
            setIsLoading(false);
          },
          (err) => {
            console.log('Erro ao salvar modelo: ', err);
            Alert.alert('Erro', 'Não foi possível salvar o modelo');
            setIsLoading(false);
          }
        );
      });
    }
  };

  const handleEdit = (modelo) => {
    setEditingModelo(modelo);
    setNomeModelo(modelo.nome_modelo);
    setTipoAtivo(modelo.Tipo);
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemTextContainer}>
        <Text style={styles.listItemText}>Nome: {item.nome_modelo}</Text>
        <Text style={styles.listItemText}>Tipo: {item.Tipo}</Text>
      </View>
      <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editIcon}>
        <Text style={styles.editText}>Editar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground source={require('./src/img/fundo.png')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <Text style={styles.title}>Cadastro de Modelos</Text>
  
        <Text style={styles.label}>Nome do Modelo</Text>
        <TextInput
          style={styles.input}
          value={nomeModelo}
          onChangeText={setNomeModelo}
        />
  
        <Text style={styles.label}>Tipo do Ativo</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={tipoAtivo}
            style={styles.picker}
            onValueChange={(itemValue) => setTipoAtivo(itemValue)}
          >
            <Picker.Item label="Notebook" value="Notebook" />
            <Picker.Item label="Monitor" value="Monitor" />
            <Picker.Item label="Smartphone" value="Smartphone" />
          </Picker>
        </View>
  
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleSave} 
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Cadastrando...' : editingModelo ? 'Atualizar Modelo' : 'Salvar Modelo'}
          </Text>
        </TouchableOpacity>
  
        <FlatList
          data={modelos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#A0A0A0',
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
    color: '#333',
  },
  editIcon: {
    marginLeft: 10,
  },
  editText: {
    color: '#007BFF',
    fontSize: 16,
  },
});

export default CadastroModelosScreen;
