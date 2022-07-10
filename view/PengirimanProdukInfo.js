import React, { Component } from 'react'
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native'
import Icon from "react-native-vector-icons/Ionicons";

export class PengirimanProdukInfo extends Component {

    render() {
        return (
        <View style={styles.container}>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingHorizontal: 20,
                    paddingTop: 15,
                    paddingBottom: 10,
                    backgroundColor: "white",
                }}
            >
                <View style={{ marginTop: 20 }}>
                    <TouchableOpacity
                        onPress={() => {
                        const { navigation } = this.props;
                        navigation.goBack();
                    }}
                    >
                    <Icon
                        name={"chevron-back-outline"}
                        size={25}
                        color={"#666872"}
                    />
                    </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 20}}>
                Pengiriman Produk
                </Text>
                <View style={{ marginTop: 20 }}>
                    <TouchableOpacity
                        onPress={() => {
                        const { navigation } = this.props;
                        navigation.push("PrivasiKeamanan");
                    }}
                    >
                    <Icon
                        name={"chevron-forward-outline"}
                        size={25}
                        color={"#666872"}
                    />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{
                backgroundColor: "white",
                marginVertical: 10,
                borderRadius: 10,
                padding: 10,
                marginHorizontal: 10,
                borderWidth:1,
                borderColor:'black'
            }}>
                <View style={styles.textContainer}>
                    <Text style={styles.textNumber}>1.</Text>
                    <Text style={styles.text}>Pengiriman produk akan dilakukan setelah pembayaran  dikonfirmasi oleh admin.
                    </Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.textNumber}>2.</Text>
                    <Text style={styles.text}>Biaya pengiriman akan dikenakan kepada pelanggan.
                    </Text>
                </View>
            </View>
        </View>
        )
    }
}

export default PengirimanProdukInfo

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: "#F6F6F6",
    },
    textContainer:{
        flexDirection: 'row',
        marginBottom: 2,
    },
    textNumber:{
        fontSize:10,
        marginRight:5,
    },
    text:{
        fontSize:10,
    }
})