import React, { Component } from 'react'
import { Text, View, TouchableOpacity , StyleSheet} from 'react-native'
import Icon from "react-native-vector-icons/Ionicons";

export class TermsNConditionInfo extends React.Component {

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
                Terms & Condition
                </Text>
                <View style={{ marginTop: 20 }}>
                    <TouchableOpacity
                        onPress={() => {
                        const { navigation } = this.props;
                        navigation.push("PengirimanProduk");
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
                    <Text style={styles.text}>Pesanan yang anda pesan melalui situs BiShare Marketplace akan berstatus disetujui ketika pesanan anda telah 
                    dikonfirmasi oleh penjual.
                    </Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.textNumber}>2.</Text>
                    <Text style={styles.text}>Pastikan pesanan anda sesuai dengan membaca deskripsi produk sebelum membeli.
                    </Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.textNumber}>3.</Text>
                    <Text style={styles.text}>Pembayaran atas pesanan anda dapat dilakukan melalui Transfer Bank dan Tunai.
                    </Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.textNumber}>4.</Text>
                    <Text style={styles.text}>Biaya layanan aplikasi dibebankan kepada anda sesuai ketentuan.
                    </Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.textNumber}>5.</Text>
                    <Text style={styles.text}>Biaya Jasa pengiriman dapat berubah sewaktu-waktu.
                    </Text>
                </View>
            </View>
        </View>    
        )
    }
}

export default TermsNConditionInfo

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