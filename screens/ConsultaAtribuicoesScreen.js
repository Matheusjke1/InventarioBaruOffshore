import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, TextInput, ImageBackground } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

// Abrindo o banco de dados SQLite
const db = SQLite.openDatabase(
  { name: 'inventarioBaru.db', location: 'default' },
  () => { console.log('Banco de dados aberto'); },
  (err) => { console.log('Erro ao abrir o banco de dados: ', err); }
);

const ConsultaAtribuicoesScreen = () => {
  const [atribuicoes, setAtribuicoes] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // Estado para a busca
  const [filteredAtribuicoes, setFilteredAtribuicoes] = useState([]); // Estado para a lista filtrada

  // Função para consultar as atribuições
  const consultarAtribuicoes = () => {
    if (searchQuery.trim() === '') {
      Alert.alert('Erro', 'Por favor, insira um termo de busca');
      return;
    }

    db.transaction((tx) => {
      const query = `
        SELECT a.id, u.userMatricula, u.userIMO, a.serial, a.data_recebimento, a.documento
        FROM Associacao a
        JOIN Usuarios u ON (u.userMatricula = a.userID OR u.userIMO = a.userID)
        WHERE u.userMatricula LIKE ? OR u.userIMO LIKE ? OR a.serial LIKE ?
      `;

      const searchTerm = `%${searchQuery}%`; // Adicionando % para correspondência parcial
      console.log('Buscando por:', searchTerm); // Verifica o valor de busca

      tx.executeSql(
        query,
        [searchTerm, searchTerm, searchTerm], // Buscando tanto por userMatricula, userIMO e serial
        (tx, results) => {
          const rows = results.rows.raw();
          console.log('Resultados da consulta:', rows); // Verifica os resultados retornados
          if (rows.length > 0) {
            setAtribuicoes(rows); // Atualiza o estado com os resultados da consulta
          } else {
            setAtribuicoes([]); // Nenhuma atribuição encontrada
          }
        },
        (err) => {
          console.log('Erro ao consultar as atribuições: ', err);
          Alert.alert('Erro', 'Não foi possível carregar as atribuições');
        }
      );
    });
  };

  // Filtro das atribuições com base na busca
  useEffect(() => {
    // Filtrando as atribuições sempre que o texto de busca mudar
    setFilteredAtribuicoes(
      atribuicoes.filter((item) => {
        return (
          item.userMatricula.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.userIMO.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.serial.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    );
  }, [searchQuery, atribuicoes]);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>Matrícula: {item.userMatricula}</Text>
      <Text style={styles.itemText}>IMO: {item.userIMO}</Text>
      <Text style={styles.itemText}>Número de Série: {item.serial}</Text>
      <Text style={styles.itemText}>Data de Recebimento: {item.data_recebimento}</Text>
      <Text style={styles.itemText}>Documento: {item.documento}</Text>
      <TouchableOpacity style={styles.button} onPress={() => handleUnassign(item.serial)}>
        <Text style={styles.buttonText}>Desassociar Ativo</Text>
      </TouchableOpacity>
      <Text style={styles.separator}></Text>
    </View>
  );

  return (
    <ImageBackground 
      source={require('./src/img/fundo.png')}
      style={styles.container}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Consulta de Atribuições</Text>

        {/* Campo de busca */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por Matrícula, IMO ou Número de Série"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchButton} onPress={consultarAtribuicoes}>
            <Text style={styles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={filteredAtribuicoes} // Utilizando a lista filtrada
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma atribuição encontrada</Text>}
        />
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
  searchContainer: {
    flexDirection: 'column',
    marginBottom: 20,
    alignItems: 'center',
  },
  searchInput: {
    height: 50,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  searchButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
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
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
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

export default ConsultaAtribuicoesScreen;
