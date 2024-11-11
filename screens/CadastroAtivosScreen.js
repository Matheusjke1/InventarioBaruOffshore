import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  { name: 'inventarioBaru.db', location: 'default' },
  () => { console.log('Banco de dados aberto'); },
  (err) => { console.log('Erro ao abrir o banco de dados: ', err); }
);

const CadastroAtivosScreen = () => {
  const [numeroSerie, setNumeroSerie] = useState('');
  const [tipoAtivo, setTipoAtivo] = useState('');
  const [fabricante, setFabricante] = useState('');
  const [modelo, setModelo] = useState('');
  const [numPatrimonio, setNumPatrimonio] = useState('');
  const [imei, setImei] = useState('');
  const [showImei, setShowImei] = useState(false);
  const [fabricantes, setFabricantes] = useState([]);
  const [modelos, setModelos] = useState([]);

  useEffect(() => {
    loadFabricantes();
    loadModelos();
  }, []);

  const loadFabricantes = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT nome_fabricante FROM Fabricantes',
        [],
        (tx, results) => {
          const data = [];
          for (let i = 0; i < results.rows.length; i++) {
            data.push(results.rows.item(i).nome_fabricante);
          }
          setFabricantes(data);
        },
        (error) => {
          console.log('Erro ao carregar fabricantes:', error);
        }
      );
    });
  };

  const loadModelos = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT nome_modelo FROM ModeloAtivo',
        [],
        (tx, results) => {
          const data = [];
          for (let i = 0; i < results.rows.length; i++) {
            data.push(results.rows.item(i).nome_modelo);
          }
          setModelos(data);
        },
        (error) => {
          console.log('Erro ao carregar modelos:', error);
        }
      );
    });
  };

  const handleTipoAtivoChange = (value) => {
    setTipoAtivo(value);
    setShowImei(value === 'Smartphone');
  };

  const handleCadastro = () => {
    if (!numeroSerie || !tipoAtivo || !fabricante || !modelo || (showImei && !imei)) {
      Alert.alert('Erro', 'Todos os campos obrigatórios devem ser preenchidos.');
      return;
    }

    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO Ativos (serial, tipoAtivo, fabricante, modelo, numPatrimonio, imei) VALUES (?, ?, ?, ?, ?, ?)',
        [numeroSerie, tipoAtivo, fabricante, modelo, numPatrimonio, imei],
        (tx, result) => {
          console.log('Ativo cadastrado com sucesso!', result);
          Alert.alert('Sucesso', 'Ativo cadastrado com sucesso.');
          setNumeroSerie('');
          setTipoAtivo('');
          setFabricante('');
          setModelo('');
          setNumPatrimonio('');
          setImei('');
          setShowImei(false);
        },
        (err) => {
          console.log('Erro ao cadastrar ativo: ', err);
          Alert.alert('Erro', 'Não foi possível cadastrar o ativo.');
        }
      );
    });
  };

  return (
    <ImageBackground source={require('./src/img/fundo.png')} style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Cadastro de Ativos</Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Número de Série</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o Número de Série"
            value={numeroSerie}
            onChangeText={setNumeroSerie}
          />

          <Text style={styles.label}>Tipo do Ativo</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tipoAtivo}
              onValueChange={handleTipoAtivoChange}
              style={styles.picker}
            >
              <Picker.Item label="Selecione o tipo do ativo" value="" />
              <Picker.Item label="Smartphone" value="Smartphone" />
              <Picker.Item label="Notebook" value="Notebook" />
              <Picker.Item label="Monitor" value="Monitor" />
            </Picker>
          </View>

          {showImei && (
            <>
              <Text style={styles.label}>IMEI</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite o IMEI"
                value={imei}
                onChangeText={setImei}
              />
            </>
          )}

          <Text style={styles.label}>Fabricante</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={fabricante}
              onValueChange={(itemValue) => setFabricante(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecione o fabricante" value="" />
              {fabricantes.map((fab, index) => (
                <Picker.Item key={index} label={fab} value={fab} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Modelo</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={modelo}
              onValueChange={(itemValue) => setModelo(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecione o modelo" value="" />
              {modelos.map((mod, index) => (
                <Picker.Item key={index} label={mod} value={mod} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Número de Patrimônio</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o Número de Patrimônio"
            value={numPatrimonio}
            onChangeText={setNumPatrimonio}
          />

          <TouchableOpacity style={styles.button} onPress={handleCadastro}>
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
  },
  picker: {
    height: 50,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CadastroAtivosScreen;
