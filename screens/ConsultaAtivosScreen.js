import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

// Abrindo o banco de dados SQLite
const db = SQLite.openDatabase(
  { name: 'inventarioBaru.db', location: 'default' },
  () => { console.log('Banco de dados aberto'); },
  (err) => { console.log('Erro ao abrir o banco de dados: ', err); }
);

const ConsultaAtivosScreen = () => {
  const [ativos, setAtivos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');

  // Função para consultar os ativos pelo número de série
  const consultarAtivos = () => {
    if (searchQuery.trim() === '') {
      setMessage('Por favor, insira um número de série para buscar');
      setAtivos([]);
      return;
    }

    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM Ativos WHERE serial = ?',
        [searchQuery],
        (tx, results) => {
          const rows = results.rows.raw();
          if (rows.length > 0) {
            setAtivos(rows);
            setMessage('');
          } else {
            setAtivos([]);
            setMessage('Nenhum ativo encontrado');
          }
        },
        (err) => {
          console.log('Erro ao consultar os ativos: ', err);
          Alert.alert('Erro', 'Não foi possível carregar os ativos');
        }
      );
    });
  };

  // Função de busca
  const handleSearch = (text) => {
    setSearchQuery(text);
    setMessage('');  // Limpa a mensagem ao digitar no campo de busca
  };

  useEffect(() => {
    // Não faz nada, apenas evita erro de consulta quando a tela for carregada
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>Número de Série: {item.serial || 'N/A'}</Text>
      <Text style={styles.itemText}>Número de Patrimônio: {item.numero_patrimonio || 'N/A'}</Text>
      {/* Aqui você pode adicionar mais campos de detalhes do ativo conforme necessário */}
      <Text style={styles.separator}></Text>
    </View>
  );

  return (
    <ImageBackground 
      source={require('./src/img/fundo.png')}
      style={styles.container}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Consulta de Ativos</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por número de série"
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={consultarAtivos}>
          <Text style={styles.buttonText}>Buscar</Text>
        </TouchableOpacity>
        {message ? (
          <Text style={styles.emptyText}>{message}</Text>
        ) : (
          <FlatList
            data={ativos}
            renderItem={renderItem}
            keyExtractor={(item) => item.id ? item.id.toString() : '0'}
          />
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 20,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff', // Cor de fundo branca
  },
  searchButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  itemContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  itemText: {
    fontSize: 16,
    color: '#000',
  },
  separator: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default ConsultaAtivosScreen;
