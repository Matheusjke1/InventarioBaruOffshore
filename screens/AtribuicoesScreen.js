import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import SQLite from 'react-native-sqlite-storage';

// Abrindo o banco de dados SQLite
const db = SQLite.openDatabase(
  { name: 'inventarioBaru.db', location: 'default' },
  () => { console.log('Banco de dados aberto'); },
  (err) => { console.log('Erro ao abrir o banco de dados: ', err); }
);

const AtribuicoesScreen = () => {
  const [userID, setUserID] = useState('');  // userID será preenchido com matrícula ou IMO
  const [numeroSerie, setNumeroSerie] = useState('');
  const [dataRecebimento, setDataRecebimento] = useState('');
  const [documento, setDocumento] = useState(null);

  // Função para criar a tabela de associação caso não exista
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Associacao (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          serial TEXT NOT NULL,
          userID INTEGER NOT NULL,
          data_recebimento TEXT NOT NULL,
          documento TEXT,
          FOREIGN KEY (serial) REFERENCES Ativos(serial),
          FOREIGN KEY (userID) REFERENCES Usuarios(id)
        )`,
        [],
        () => { console.log('Tabela Associacao criada ou já existente'); },
        (err) => { console.log('Erro ao criar a tabela de associação: ', err); }
      );
    });
  }, []);

  const handleSave = () => {
    if (!userID || !numeroSerie || !dataRecebimento) {
      Alert.alert('Erro', 'Todos os campos obrigatórios devem ser preenchidos');
      return;
    }
  
    // Verifica se a data de recebimento está no formato correto
    const regexData = /^\d{2}-\d{2}-\d{4}$/;
    if (!regexData.test(dataRecebimento)) {
      Alert.alert('Erro', 'Data de Recebimento deve estar no formato DD-MM-AAAA');
      return;
    }
  
    // Remove espaços extras da entrada do userID
    const cleanedUserID = userID.trim();
  
    // Log para verificar o valor que estamos buscando
    console.log('Buscando usuário com Matricula ou IMO:', cleanedUserID);
  
    // Buscando o usuário no banco de dados com base na matrícula ou IMO
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM Usuarios WHERE userMatricula = ? OR userIMO = ?',
        [cleanedUserID, cleanedUserID],
        (tx, result) => {
          if (result.rows.length > 0) {
            const usuario = result.rows.item(0);  // Pegando o primeiro usuário encontrado
            console.log('Usuário encontrado:', usuario);
  
            // Insere a associação entre o ativo e o usuário
            db.transaction((tx2) => {
              tx2.executeSql(
                'INSERT INTO Associacao (serial, userMatricula, userIMO, data_recebimento, documento) VALUES (?, ?, ?, ?, ?)',
                [numeroSerie, usuario.userMatricula, usuario.userIMO, dataRecebimento, documento ? documento.name : null],
                (tx3, result2) => {
                  console.log('Atribuição salva com sucesso!', result2);
                  Alert.alert('Sucesso', 'Ativo atribuído ao usuário com sucesso');
                  setUserID('');
                  setNumeroSerie('');
                  setDataRecebimento('');
                  setDocumento(null);
                },
                (err) => {
                  console.log('Erro ao salvar atribuição: ', err);
                  Alert.alert('Erro', 'Não foi possível salvar a atribuição');
                }
              );
            });
          } else {
            Alert.alert('Erro', 'Usuário não encontrado');
            console.log('Usuário não encontrado, verifique os dados no banco');
          }
        },
        (err) => {
          console.log('Erro ao buscar usuário no banco: ', err);
          Alert.alert('Erro', 'Erro ao buscar usuário no banco');
        }
      );
    });
  };
  

  // Função para anexar documento
  const handleDocumentPick = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      setDocumento(res);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('Usuário cancelou a seleção do arquivo');
      } else {
        throw err;
      }
    }
  };

  return (
    <ImageBackground 
      source={require('./src/img/fundo.png')} // Defina o caminho para sua imagem de fundo
      style={styles.container}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Atribuições de Ativos</Text>

        {/* Campo para buscar usuário por ID */}
        <Text style={styles.label}>Matrícula ou IMO</Text>
        <TextInput
          placeholder="Digite a matrícula ou IMO do usuário"
          style={styles.input}
          value={userID}
          onChangeText={setUserID}
          keyboardType="numeric"
        />

        {/* Campo para buscar ativo */}
        <Text style={styles.label}>Ativo</Text>
        <TextInput
          placeholder="Buscar ativo (Número de Série)"
          style={styles.input}
          value={numeroSerie}
          onChangeText={setNumeroSerie}
        />

        {/* Campo para data de recebimento */}
        <Text style={styles.label}>Data de Recebimento (DD-MM-AAAA)</Text>
        <TextInput
          placeholder="DD-MM-AAAA"
          style={styles.input}
          value={dataRecebimento}
          onChangeText={setDataRecebimento}
        />

        {/* Botão para anexar documento (opcional) */}
        <TouchableOpacity style={styles.button} onPress={handleDocumentPick}>
          <Text style={styles.buttonText}>Anexar Documento (Opcional)</Text>
        </TouchableOpacity>

        {documento && <Text style={styles.documentText}>{documento.name}</Text>}

        {/* Botão para salvar atribuição */}
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Salvar Atribuição</Text>
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
    textAlign: 'center',
    color: '#000',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#000',
    fontWeight: 'bold',
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
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  documentText: {
    color: '#fff',
    marginBottom: 10,
  },
});

export default AtribuicoesScreen;
