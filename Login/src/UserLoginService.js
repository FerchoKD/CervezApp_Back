import bcrypt, { hash } from "bcrypt";
import AWS from "aws-sdk";
import { userModel } from "../../Models/UserModel.js";
import * as Security from "./Security/Security.js"

async function loginUserService(user) {
  let result = await findUser(user);
  if (result !== null) {
    let comparing = await comparingPassword(user.password, result.password);
    const userInfo = {
        id: result.dataValues.id,
        username: result.dataValues.name
    }
    let token = await setToken(userInfo, Security.secretKey, Security.options);
    let response = decide(comparing, result, token)
    return response;
  } else {
    return {
      status: 400,
      message: "Verifica bien tu correo",
    };
  }
}

async function findUser(user) {
  let result = await userModel.findOne({ where: { email: user.email } });
  console.log(result);
  return result;
}

async function comparingPassword(password, passwordHasheada) {
  return await bcrypt.compare(password, passwordHasheada);
}

function decide(comparing, result, token){
    if(comparing){
        return({
            status: 200,
            name: result.dataValues.name,
            image: result.dataValues.image,
            token: token
        })
    }else{
        return({
            status: 400,
            message: "Contraseña Incorrecta"
        })
    }
}

async function setToken(userInfo, secretKey, options){
    return await Security.generateToken(userInfo, secretKey, options)
}

export { loginUserService };