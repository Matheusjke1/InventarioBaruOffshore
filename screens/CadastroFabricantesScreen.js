import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList, ImageBackground } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import { Picker } from '@react-native-picker/picker'; // Corrigido para importar do pacote correto

// Inicializa o banco de dados SQLite
const db = SQLite.openDatabase(
  { name: 'inventarioBaru.db', location: 'default' },
  () => { console.log('Banco de dados aberto'); },
  (err) => { console.log('Erro ao abrir o banco de dados: ', err); }
);

// Função para validar o CNPJ
const validateCNPJ = (cnpj) => {
  const regex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
  return regex.test(cnpj);
};

// Função para formatar o CNPJ
const formatCNPJ = (cnpj) => {
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

const CadastroFabricantesScreen = () => {
  const [nomeFabricante, setNomeFabricante] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [fabricantes, setFabricantes] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Controle de carregamento
  const [editingFabricante, setEditingFabricante] = useState(null); // Controle de edição

  // Cria a tabela Fabricantes caso ela não exista
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Fabricantes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome_fabricante TEXT,
          cnpj TEXT
        )`,
        [],
        () => { console.log('Tabela Fabricantes criada com sucesso!'); },
        (err) => { console.log('Erro ao criar a tabela Fabricantes: ', err); }
      );
    });

    // Carrega fabricantes já cadastrados
    loadFabricantes();
  }, []);

  const loadFabricantes = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM Fabricantes',
        [],
        (tx, results) => {
          const fabricantesData = [];
          for (let i = 0; i < results.rows.length; i++) {
            fabricantesData.push(results.rows.item(i));
          }
          setFabricantes(fabricantesData);
        },
        (err) => { console.log('Erro ao carregar fabricantes: ', err); }
      );
    });
  };

  const handleSave = () => {
    // Valida se os campos estão preenchidos
    if (!nomeFabricante || !cnpj) {
      Alert.alert('Erro', 'Todos os campos devem ser preenchidos');
      return;
    }

    // Remove qualquer pontuação do CNPJ
    const cnpjNum = cnpj.replace(/\D/g, '');

    // Valida o formato do CNPJ
    if (cnpjNum.length !== 14) {
      Alert.alert('Erro', 'CNPJ inválido');
      return;
    }

    // Define o estado de carregamento
    setIsLoading(true);

    if (editingFabricante) {
      // Atualiza o fabricante
      db.transaction((tx) => {
        tx.executeSql(
          'UPDATE Fabricantes SET nome_fabricante = ?, cnpj = ? WHERE id = ?',
          [nomeFabricante, cnpjNum, editingFabricante.id],
          (tx, result) => {
            console.log('Fabricante atualizado com sucesso!', result);
            Alert.alert('Sucesso', 'Fabricante atualizado com sucesso');
            setNomeFabricante('');
            setCnpj('');
            setEditingFabricante(null); // Limpa o estado de edição
            loadFabricantes(); // Atualiza a lista de fabricantes
            setIsLoading(false); // Retorna ao estado inicial
          },
          (err) => {
            console.log('Erro ao atualizar fabricante: ', err);
            Alert.alert('Erro', 'Não foi possível atualizar o fabricante');
            setIsLoading(false); // Retorna ao estado inicial
          }
        );
      });
    } else {
      // Realiza a inserção no banco de dados
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO Fabricantes (nome_fabricante, cnpj) VALUES (?, ?)',
          [nomeFabricante, cnpjNum],
          (tx, result) => {
            console.log('Fabricante salvo com sucesso!', result);
            Alert.alert('Sucesso', 'Fabricante cadastrado com sucesso');
            setNomeFabricante('');
            setCnpj('');
            loadFabricantes(); // Atualiza a lista de fabricantes
            setIsLoading(false); // Retorna ao estado inicial
          },
          (err) => {
            console.log('Erro ao salvar fabricante: ', err);
            Alert.alert('Erro', 'Não foi possível salvar o fabricante');
            setIsLoading(false); // Retorna ao estado inicial
          }
        );
      });
    }
  };

  const handleEdit = (fabricante) => {
    setEditingFabricante(fabricante);
    setNomeFabricante(fabricante.nome_fabricante);
    setCnpj(fabricante.cnpj);
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemTextContainer}>
        <Text style={styles.listItemText}>Nome: {item.nome_fabricante}</Text>
        <Text style={styles.listItemText}>CNPJ: {formatCNPJ(item.cnpj)}</Text>
      </View>
      <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
        <Text style={styles.editButtonText}>Editar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground
      source={require('./src/img/fundo.png')} // Substitua pelo caminho correto da imagem
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Cadastro de Fabricantes</Text>

        <Text style={styles.label}>Nome do Fabricante</Text>
        <TextInput
          style={styles.input}
          value={nomeFabricante}
          onChangeText={setNomeFabricante}
        />

        <Text style={styles.label}>CNPJ (Somente números)</Text>
        <TextInput
          style={styles.input}
          value={cnpj}
          onChangeText={(text) => setCnpj(text.replace(/\D/g, ''))} // Remove não números
          keyboardType="numeric"
        />

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleSave} 
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Cadastrando...' : editingFabricante ? 'Atualizar Fabricante' : 'Salvar Fabricante'}
          </Text>
        </TouchableOpacity>

        <FlatList
          data={fabricantes}
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
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Semitransparente para permitir que a imagem de fundo seja visível
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
    textAlign: 'center',
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
    color: '#333',
  },
  editButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  editButtonText: {
    color: '#007BFF',
    fontSize: 14,
  },
});

export default CadastroFabricantesScreen;
