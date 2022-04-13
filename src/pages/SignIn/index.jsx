import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Button, Form, Input, Modal, notification } from "antd";
import React, { Fragment, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { strapiClient } from "../../apis/axiosClient";
import backgroundImageSignIn from "../../assets/icons/backgroundImageHome.svg";
import { user } from "../../constant/user";
import { sendPasswordReset } from "../../firebase/services/email";
import { validateMessagesInputSignIn } from "../../helpers/index";
import "./signin.scss";

const SignIn = ({ setAuth }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const history = useHistory();

  const onFinish = (info) => {
    setIsLoading(true);
    strapiClient
      .post("/auth/local", {
        identifier: info.identifier,
        password: info.password,
      })
      .then(function (data) {
        setIsLoading(false);
        user.setUserInfo(data);
        localStorage.setItem("access_token", data.jwt);
        localStorage.setItem("userInfo", JSON.stringify(data.user));
        setAuth(true);

        history.push("/");
      })
      .catch(function (error) {
        setIsLoading(false);
        notification["error"]({
          message: "Đăng nhập thất bại",
          description: error?.message || "",
        });
      });
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const onFinishForgot = (info) => { };

  // useEffect(() => {
  //     setTimeout(() => setIsLoading(false), 1500)
  // }, []);

  const FormItem = Form.Item;

  const [forgot, setForgot] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      history.push("/");
    }
  }, [history]);

  return (
    <Fragment>
      {
        // isLoading ? <div className="signInBackGround" style={{ backgroundImage: `url(${backgroundLoading})` }}></div> :
        <div
          className="signInBackGround"
        //style={{ backgroundImage: `url(${backgroundImageSignIn})` }}
        >
          <Modal
            title={<span className="title">Xin Chào!</span>}
            centered
            width={600}
            visible={true}
            footer={[]}
          >
            <Form
              form={form}
              name="advanced_search"
              className="flex flex-column"
              onFinish={onFinish}
              validateMessages={validateMessagesInputSignIn}
            >
              <FormItem
                name={["identifier"]}
                rules={[
                  { type: "email", message: "E-mail không hợp lệ" },
                  { required: true, message: "Vui lòng nhập E-mail công ty" },
                ]}
              >
                <Input
                  className="inputSignin"
                  size="large"
                  placeholder="Nhập E-mail công ty"
                />
              </FormItem>
              <FormItem
                name={["password"]}
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
              >
                <Input.Password
                  type="password"
                  className="inputSignin"
                  size="large"
                  placeholder="Nhập mật khẩu"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </FormItem>
              {/* <Form.Item name="remember" valuePropName="checked">
                                    <Checkbox>Ghi nhớ mật khẩu</Checkbox>
                                </Form.Item> */}
              <Button
                loading={isLoading}
                className="btnConfirm"
                htmlType="submit"
              >
                Đăng nhập
              </Button>
              <Button
                onClick={() => setForgot(true)}
                key="forgot"
                className="btnForgot"
              >
                Quên mật khẩu
              </Button>
            </Form>
          </Modal>
          <Modal
            title={
              <Fragment>
                <p className="title__forgot">Thiết lập mật khẩu mặc định</p>
                <span>
                  Mật khẩu của bạn sẽ được thiết lập lại và gửi vào email cung
                  cấp
                </span>
              </Fragment>
            }
            centered
            width={460}
            visible={forgot}
            className="forgot__password"
            footer={[]}
          >
            <Form
              className="flex flex-column"
              onFinish={onFinishForgot}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item
                name={["email"]}
                rules={[
                  { type: "email", message: "E-mail không hợp lệ" },
                  { required: true, message: "Vui lòng nhập E-mail công ty" },
                ]}
              >
                <Input size="large" placeholder="Nhập E-mail công ty" />
              </Form.Item>
              <div className="flex justify-center">
                <Button
                  onClick={() => setForgot(false)}
                  className="btnReturn"
                  key="return"
                >
                  Hủy
                </Button>
                <Button
                  loading={isLoading}
                  className="btnSend"
                  htmlType="submit"
                  key="confirm"
                >
                  Gửi
                </Button>
              </div>
            </Form>
          </Modal>
        </div>
      }
    </Fragment>
  );
};

export default SignIn;
