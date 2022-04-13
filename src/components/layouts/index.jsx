import React, { Fragment, useState, useEffect } from "react";
import {
  useHistory,
  useLocation,
  matchPath,
  NavLink,
  useRouteMatch,
} from "react-router-dom";
import { Layout, Menu } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { ReactComponent as IconHome } from "../../assets/icons/menu/home.svg";
import { ReactComponent as IconCart } from "../../assets/icons/menu/cart.svg";


import "../../assets/styles/Menu/Styles.scss";
import slugs from "../../constant/slugs";
import logoPinnow from "../../assets/logo-pinnow-inline.svg";
import SignOutPages from "../../pages/SignOut";
import { createFromIconfontCN } from "@ant-design/icons";
import "./style.scss";
import SubMenu from "antd/lib/menu/SubMenu";

const { Header, Sider, Content } = Layout;

const IconFont = createFromIconfontCN({
  scriptUrl: [
    "//at.alicdn.com/t/font_1788044_0dwu4guekcwr.js", // icon-javascript, icon-java, icon-shoppingcart (overrided)
    "//at.alicdn.com/t/font_1788592_a5xf2bdic3u.js", // icon-shoppingcart, icon-python
  ],
});

const LayoutContainer = ({ children, auth }) => {
  const history = useHistory();
  const location = useLocation();
  const [state, setState] = useState({
    collapsed: false,
  });

  const [activeMenuKey, setActiveMenuKey] = useState(undefined);

  const onCollapse = () => {
    setState({ collapsed: !state.collapsed });
  };

  const match = useRouteMatch({
    path: "/customer/detail/:id",
    strict: true,
    sensitive: true,
  });

  useEffect(() => {
    if (!auth) {
      history.push(slugs.signIn);
    }
  }, [auth, history]);

  useEffect(() => {
    if (location.pathname === "/") {
      setActiveMenuKey("0");
    }
    if (matchPath(location.pathname, { path: "/dashboard" })) {
      setActiveMenuKey("0");
    }
    if (matchPath(location.pathname, { path: "/articles" })) {
      setActiveMenuKey("1");
    }

  }, [location]);

  return (
    <Fragment>
      {!auth ? null : (
        <Layout className="custom-layout" style={{ minHeight: "100vh" }}>
          <Sider
            className="custom-sider"
            theme="light"
            trigger={null}
            collapsible
            collapsed={state.collapsed}
            onCollapse={onCollapse}
          >
            <div className="p-2 flex logo justify-between">
              <img
                src={logoPinnow}
                alt="logo pinnow"
                style={{ marginTop: "-14px", width: "101px" }}
              />{" "}
              {React.createElement(
                state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                { className: "trigger", onClick: onCollapse }
              )}
            </div>
            <Menu
              style={{ paddingTop: "20px" }}
              defaultOpenKeys={["sub1"]}
              selectedKeys={activeMenuKey}
              defaultSelectedKeys={[activeMenuKey]}
              mode="inline"
              theme="light"
            >
              {/* <Menu.Item key="0" icon={<IconHome />}>
                <NavLink to={`/`}>Dashboard</NavLink>
              </Menu.Item> */}
              <SubMenu
                key="sub6"
                icon={<IconHome />}
                title={<div style={{ paddingLeft: "10px" }}>Dashboard</div>}
              >
                <Menu.Item
                  key="0"
                  onClick={() => history.push(slugs.dashboard)}
                >
                  Dashboard thống kê
                </Menu.Item>
                <Menu.Item
                  key="15"
                  onClick={() => history.push(slugs.dashboardShipper)}
                >
                  Dashboard shipper
                </Menu.Item>
              </SubMenu>
              <Menu.Item key="1" icon={<IconCart />}>
                <NavLink to={`/articles`}>Tin tức</NavLink>
              </Menu.Item>
            </Menu>
          </Sider>

          <Layout className="site-layout">
            <Header
              className="site-layout-background flex justify-end"
              style={{ padding: 0 }}
            >
              <SignOutPages />
            </Header>
            <Content
              className="site-main-background"
              style={{
                padding: "32px 42px 42px 42px",
                minHeight: 280,
              }}
            >
              {children}
            </Content>
          </Layout>
        </Layout>
      )}
    </Fragment>
  );
};

export default LayoutContainer;
