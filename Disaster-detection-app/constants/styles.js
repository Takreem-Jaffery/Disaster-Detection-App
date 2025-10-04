import {View, Text, Image, TextInput, Touchable} from 'react-native'
import styled from 'styled-components/native'
import Constants from 'expo-constants'

const StatusBarHeight = Constants.statusBarHeight;

export const Colors = {
    primary: "#fff",
    secondary: "#000",
    tertiary: "#e1eaf9ff",
    darkLight: "#26354fff",
    brand: "rgba(121, 106, 198, 1)"
}

const {primary, secondary, tertiary, darkLight, brand} = Colors

export const StyledContainer = styled.View`
     flex: 1;
     padding: 25px;
     padding-top: ${StatusBarHeight + 10}px;
     background-color: ${primary};
`

export const InnerContainer = styled.View`
    flex: 1;
    width: 100%;
    align-items: center;
    justify-content: center;
`

export const PageLogo = styled.Image`
    width:170px;
    height:150px;
`
export const PageTitle = styled.Text`
    font-size: 27px;
    text-align: center;
    font-weight: bold;
    color: ${brand};

    ${(props)=> props.home && `
        font-size:28px;
    `}
`
export const SubTitle = styled.Text`
    font-size: 20px;
    margin-bottom: 20px;
    letter-spacing: 1px;
    font-weight: bold;
    color: ${secondary};

    ${(props)=> props.home && `
        margin-bottom:5px;
        font-weight:normal;
    `}
`

export const StyledFormArea = styled.View`
    width:320px;
`
export const StyledTextInput = styled.TextInput`
    background-color: ${tertiary};
    padding: 15px;
    padding-left: 55px;
    padding-right: 55px;
    border-radius: 5px;
    font-size: 16px;
    height: 60px;
    width: 320px;
    margin-vertical: 3px;
    margin-bottom: 10px;
    align-self:center;
    color: ${secondary};
`

export const StyledInputLabel = styled.Text`
    color: ${secondary};
    font-size: 15px;
    text-align: left;
    left:15px;
`

export const LeftIcon = styled.View`
    left:15px;
    top:40px;
    position:absolute;
    z-index: 1;
`
export const RightIcon = styled.TouchableOpacity`
    right:15px;
    top:38px;
    position:absolute;
    z-index: 1;
`

export const StyledButton = styled.TouchableOpacity`
    padding: 5px;
    background-color: ${brand};
    justify-content:center;
    border-radius:5px;
    margin-vertical:5px;
    height:60px;
    align-items:center;
`

export const ButtonText = styled.Text`
    color: ${primary};
    font-size:20px;
    font-weight:bold;
`

export const MsgBox = styled.Text`
    text-align:center;
    font-size: 13px;
`

export const Line = styled.View`
    height:1px;
    width:100%;
    background-color: ${darkLight};
    margin-vertical:10px;
`
export const ExtraView = styled.View`
    justify-content: center;
    flex-direction: row;
    align-items:center;
    padding:10px;
`

export const ExtraText=styled.Text`
    justify-content: center;
    align-content: center;
    color: ${secondary};
    font-size: 15px;
    margin-right:5px;
`

export const TextLink=styled.TouchableOpacity`
    justify-content:center;
    align-items:center;
`

export const TextLinkContent = styled.Text`
    color:${brand};
    font-size:15px;
`

export const HomeContainer = styled(InnerContainer)`
    padding:24px;
    padding-top:10px;
    justify-content:center;
    background-color:${primary};
`

export const Avatar = styled.Image`
    width:100px;
    height:100px;
    margin:auto;
    border-radius:50px;
    border:3px solid;
    border-color:${tertiary};
    margin-bottom:10px;
    margin-top:10px;
`

export const HomeImage = styled.Image`
    height:50%;
    min-width:100%;
`
export const RadioOuter = styled.View`
  height: 24px;
  width: 24px;
  border-radius: 12px;
  border-width: 2px;
  border-color: #6c63ff; /* brand color */
  align-items: center;
  justify-content: center;
  margin-right: 10px;
`;

export const RadioInner = styled.View`
  height: 12px;
  width: 12px;
  border-radius: 6px;
  background-color: #6c63ff;
`;