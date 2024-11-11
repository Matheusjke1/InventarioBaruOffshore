import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';

const MenuConsultaScreen = ({ navigation }) => {
  return (
    <ImageBackground
      source={require('./src/img/fundo.png')} // Caminho para o background da tela
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Consultas</Text>

        <TouchableOpacity 
          onPress={() => navigation.navigate('ConsultaUsuariosScreen')}
          style={styles.iconContainer}
        >
          <Image source={require('./src/img/icon_users.png')} style={styles.icon} />
          <Text style={styles.iconText}>Usuários</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('ConsultaAtribuicoesScreen')}
          style={styles.iconContainer}
        >
          <Image source={require('./src/img/icon_atribuicoes.png')} style={styles.icon} />
          <Text style={styles.iconText}>Associações</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('ConsultaAtivosScreen')}
          style={styles.iconContainer}
        >
          <Image source={require('./src/img/icon_ativos.png')} style={styles.icon} />
          <Text style={styles.iconText}>Ativos</Text>
        </TouchableOpacity>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#fff', // Cor do título, para se destacar no fundo
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007BFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    width: 160, // Tamanho do botão
    height: 160, // Tamanho do botão
    marginBottom: 30,
  },
  icon: {
    width: 90,
    height: 90,
    tintColor: '#007BFF', // Cor de tint no ícone
    marginBottom: 10,
  },
  iconText: {
    fontSize: 16,
    color: '#007BFF',
    fontWeight: '600',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
});

export default MenuConsultaScreen;
