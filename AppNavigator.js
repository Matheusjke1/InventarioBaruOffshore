import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importação das telas
import LoginScreen from './screens/LoginScreen';
import ResetSenhaScreen from './screens/ResetSenhaScreen';
import SignUpScreen from './screens/SignUpScreen';
import MenuScreen from './screens/MenuScreen';
import AtivosScreen from './screens/AtivosScreen';
import CadastroAtivosScreen from './screens/CadastroAtivosScreen';
import CadastroFabricantesScreen from './screens/CadastroFabricantesScreen';
import CadastroFornecedoresScreen from './screens/CadastroFornecedoresScreen';
import CadastroModelosScreen from './screens/CadastroModelosScreen';
import CadastroUsuariosScreen from './screens/CadastroUsuariosScreen';
import AtribuicoesScreen from './screens/AtribuicoesScreen';
import MenuConsultaScreen from './screens/MenuConsultaScreen';  // Nova tela de consultas
import ConsultaUsuariosScreen from './screens/ConsultaUsuariosScreen'; // Tela de consulta de usuários
import ConsultaAtribuicoesScreen from './screens/ConsultaAtribuicoesScreen'; // Tela de consulta de associações
import ConsultaAtivosScreen from './screens/ConsultaAtivosScreen'; // Tela de consulta de ativos

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="LoginScreen"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="ResetSenhaScreen" component={ResetSenhaScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="MenuScreen" component={MenuScreen} />
        <Stack.Screen name="MenuConsultaScreen" component={MenuConsultaScreen} />
        <Stack.Screen name="AtivosScreen" component={AtivosScreen} />
        <Stack.Screen name="CadastroAtivosScreen" component={CadastroAtivosScreen} />
        <Stack.Screen name="CadastroFabricantesScreen" component={CadastroFabricantesScreen} />
        <Stack.Screen name="CadastroFornecedoresScreen" component={CadastroFornecedoresScreen} />
        <Stack.Screen name="CadastroModelosScreen" component={CadastroModelosScreen} />
        <Stack.Screen name="CadastroUsuariosScreen" component={CadastroUsuariosScreen} />
        <Stack.Screen name="AtribuicoesScreen" component={AtribuicoesScreen} />
        <Stack.Screen name="ConsultaUsuariosScreen" component={ConsultaUsuariosScreen} />
        <Stack.Screen name="ConsultaAtribuicoesScreen" component={ConsultaAtribuicoesScreen} />
        <Stack.Screen name="ConsultaAtivosScreen" component={ConsultaAtivosScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
