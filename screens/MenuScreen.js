import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Text, ImageBackground } from 'react-native';

const MenuScreen = ({ navigation }) => {
  return (
    <ImageBackground source={require('./src/img/fundo.png')} style={styles.background}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.navigate('AtivosScreen')} style={styles.iconContainer}>
          <Image source={require('./src/img/icon_ativos.png')} style={styles.icon} />
          <Text style={styles.iconText}>Ativos</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('CadastroUsuariosScreen')} style={styles.iconContainer}>
          <Image source={require('./src/img/icon_users.png')} style={styles.icon} />
          <Text style={styles.iconText}>Usuários</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('AtribuicoesScreen')} style={styles.iconContainer}>
          <Image source={require('./src/img/icon_atribuicoes.png')} style={styles.icon} />
          <Text style={styles.iconText}>Atribuições</Text>
        </TouchableOpacity>

        {/* Botão para navegar até a tela MenuConsultaScreen */}
        <TouchableOpacity onPress={() => navigation.navigate('MenuConsultaScreen')} style={styles.iconContainer}>
          <Image source={require('./src/img/icon_consultas.png')} style={styles.icon} />
          <Text style={styles.iconText}>Consultas</Text>
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
    paddingVertical: 40, // Distância do topo e do fundo
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15, // Menor padding para reduzir o tamanho dos botões
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007BFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    width: 140, // Reduzido para um tamanho menor
    height: 140, // Reduzido proporcionalmente
    marginBottom: 20, // Espaçamento menor entre os botões
  },
  icon: {
    width: 70,  // Ícones um pouco menores
    height: 70, // Proporcional ao tamanho do botão
    tintColor: '#007BFF', // Cor de tint no ícone
    marginBottom: 10,
  },
  iconText: {
    fontSize: 14, // Tamanho de fonte reduzido para manter proporção com o botão
    color: '#007BFF',
    fontWeight: '600',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
});

export default MenuScreen;
