import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

// Abrindo o banco de dados SQLite
const db = SQLite.openDatabase(
  { name: 'inventarioBaru.db', location: 'default' },
  () => { console.log('Banco de dados aberto'); },
  (err) => { console.log('Erro ao abrir o banco de dados: ', err); }
);

// Função para garantir que a tabela e colunas existam
const criarTabelaUsuarios = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS Usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userNome TEXT NOT NULL,
        userMatricula TEXT NOT NULL,
        userStatus TEXT DEFAULT 'ativo'
      )`,
      [],
      () => {
        console.log('Tabela Usuarios criada ou já existe');
      },
      (err) => {
        console.error('Erro ao criar a tabela Usuarios:', err);
      }
    );
  });
};

const ConsultaUsuariosScreen = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Verificar e criar a tabela 'Usuarios' se necessário
  useEffect(() => {
    criarTabelaUsuarios();  // Chama a função para garantir que a tabela exista
  }, []);

  const consultarUsuarios = () => {
    if (searchQuery.trim() === '') {
      setUsuarios([]); // Limpa a lista se não houver consulta
      return;
    }

    setLoading(true); // Define o carregamento como true durante a consulta

    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM Usuarios WHERE userNome LIKE ? OR userMatricula LIKE ?',
        [`%${searchQuery}%`, `%${searchQuery}%`],
        (tx, results) => {
          const rows = results.rows.raw();
          if (rows.length > 0) {
            setUsuarios(rows); // Atualiza a lista de usuários
          } else {
            setUsuarios([]); // Se não houver usuários, limpa a lista
          }
          setLoading(false); // Finaliza o carregamento
        },
        (err) => {
          console.error('Erro ao consultar os usuários: ', err);
          Alert.alert('Erro', 'Não foi possível carregar os usuários. Verifique o banco de dados.');
          setLoading(false); // Finaliza o carregamento
        }
      );
    });
  };

  const handleDesativar = (usuarioId) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE Usuarios SET userStatus = "desativado" WHERE id = ?',
        [usuarioId],
        (tx, result) => {
          Alert.alert('Sucesso', 'Usuário desativado com sucesso!');
          consultarUsuarios();
        },
        (err) => {
          console.log('Erro ao desativar o usuário: ', err);
          Alert.alert('Erro', 'Não foi possível desativar o usuário');
        }
      );
    });
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      consultarUsuarios(); // Faz a consulta sempre que a pesquisa mudar
    }
  }, [searchQuery]);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>Nome: {item.userNome}</Text>
      <Text style={styles.itemText}>Matrícula: {item.userMatricula}</Text>
      <TouchableOpacity style={styles.button} onPress={() => handleDesativar(item.id)}>
        <Text style={styles.buttonText}>Desativar Usuário</Text>
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
        <Text style={styles.title}>Consulta de Usuários</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar por nome ou matrícula"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchButton} onPress={consultarUsuarios}>
          <Text style={styles.buttonText}>Buscar</Text>
        </TouchableOpacity>

        {loading ? (
          <Text style={styles.loadingText}>Carregando...</Text>  // Exibe uma mensagem de carregamento
        ) : (
          <FlatList
            data={usuarios}
            renderItem={renderItem}
            keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
            ListEmptyComponent={
              !loading && searchQuery && !usuarios.length && (
                <Text style={styles.emptyText}>Não foi encontrado nenhum usuário.</Text>
              )
            }
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
    paddingHorizontal: 10,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#fff',
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
  button: {
    backgroundColor: '#FF5733',
    paddingVertical: 8,  // Tamanho reduzido do botão
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,  // Tamanho do texto do botão reduzido
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
  loadingText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default ConsultaUsuariosScreen;
