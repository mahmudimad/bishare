import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { Picker as SelectPicker } from '@react-native-picker/picker';
import { colors, responsiveHeight } from "../../../utils";

const Pilihan = ({ label, datas, width, height, fontSize, onValueChange, selectedValue }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label(fontSize)}>{label} :</Text>
      <View style={styles.wrapperPicker}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker(width, height, fontSize)}
        >
          <Picker.Item label="--Pilih--" value="" />
          {datas.map((item, index) => {
            if ((label == "Provinsi")) {
              return (
                <Picker.Item
                  label={item.province}
                  value={item.province_id}
                  key={item.province_id}
                />
              );
            } else if(label == "Kota/Kab"){
              return (
                <Picker.Item
                  label={item.type+" "+item.city_name}
                  value={item.city_id}
                  key={item.city_id}
                />
              );
            } else {
              return <Picker.Item label={item} value={item} key={index} />;
            }
          })}
        </Picker>
      </View>
    </View>
  );
};

export default Pilihan;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  label: (fontSize) => ({
    fontSize: fontSize ? fontSize : 18,
  }),
  wrapperPicker: {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: colors.border,
  },
  picker: (width, height, fontSize) => ({
    fontSize: fontSize ? fontSize : 18,
    width: width,
    height: height ? height : responsiveHeight(46),
    marginTop: -15,
    marginBottom: 15,
  }),
});
