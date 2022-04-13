import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import "antd/dist/antd.min.css";
import "../src/assets/styles/index.scss";
import "../src/assets/styles/Override/override.scss";
import LayoutContainer from "./components/layouts";
import SignIn from "./pages/SignIn";
import slugs from "./constant/slugs";
import { ApolloProvider } from "@apollo/client";
import { client } from "./graphql/config";
import PageNotFound from "./pages/PageNotFound";
import ArticlePage from "./pages/article";
import ArticlesCreate from "./pages/article/Category/create";
import ArticlesCategoryDetail from "./pages/article/Category/detail";
import ArticlesCategoryEdit from "./pages/article/Category/edit";

function App() {
  const isAuth = localStorage.getItem("access_token") ? true : false;
  const [auth, setAuth] = useState(isAuth);
  const PrivateRoute = ({ component, path, exact, render = undefined }) => {
    const condition = localStorage.getItem("access_token");

    return condition ? (
      <Route path={path} exact={exact} component={component} render={render} />
    ) : (
      <Redirect to="/login" />
    );
  };

  return (
    <ApolloProvider client={client}>
      <Router>
        <Switch>
          <Route
            exact
            path={slugs.signIn}
            render={() => <SignIn auth={auth} setAuth={setAuth} />}
          />
          <LayoutContainer auth={auth}>
            <Switch>
              <PrivateRoute
                exact={true}
                path={slugs.dashboard}
                render={() => <div>Dashboard</div>}
              />
              <PrivateRoute
                exact={true}
                path={slugs.articles}
                component={ArticlePage}
              />
              <PrivateRoute
                exact={true}
                path={slugs.articlesCreate}
                component={ArticlesCreate}
              />
              <PrivateRoute
                exact={true}
                path={slugs.articlesDetail}
                component={ArticlesCategoryDetail}
              />
              <PrivateRoute
                exact={true}
                path={slugs.articlesEdit}
                component={ArticlesCategoryEdit}
              />
              <Route exact={true} component={PageNotFound} />
              {/* <Route exact path="/404" component={PageNotFound} /> */}
            </Switch>
          </LayoutContainer>
        </Switch>
      </Router>
    </ApolloProvider>
  );
}

export default App;
