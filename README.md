# Aveiro Gastronomia App

Aplicação mobile inspirada no Letterboxd para promover os produtos gastronómicos tradicionais de Aveiro em ambiente dark mode.

## Stack principal

- Expo 54 (React Native 0.81) com React Navigation
- Design system próprio (tokens em src/styles)
- TanStack Query para cache e sincronização de dados remotos
- react-native-maps + filtros cromáticos para o mapa temático

## APIs integradas

| Fonte | Uso |
| --- | --- |
| Wikipedia API | Resumos históricos e descrições dos produtos |
| Wikimedia Commons API | Imagens editoriais e património |
| OpenStreetMap + Overpass API | Pontos de interesse filtráveis no mapa |

## Como correr

```
npm install
npm run lint        # opcional
npx expo start      # iOS / Android / Web
```

## Estrutura

```
src/
  components/   UI reutilizável (cards, tab bars, markers)
  config/       Query Client e providers globais
  data/         Seeds e descrições das fontes
  hooks/        TanStack Query hooks
  navigation/   Bottom Tab Navigator
  screens/      Home, Explorar, Mapa, Perfil
  services/     Wikipedia, Commons, Overpass gateways
  styles/       Paleta, espaçamentos e tipografia
```

## Próximos passos sugeridos

1. Persistir o cache do TanStack Query em AsyncStorage para uso offline.
2. Adicionar ecrãs de detalhe (produto, história, local) e partilha social.
3. Sincronizar moodboards e estatísticas com backend próprio ou CMS.
