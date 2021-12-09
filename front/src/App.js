import React from 'react';
import {
  BrowserRouter,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import Layout from './route/Layout';
import Main from './views/Main';
import Vote from './views/Vote';
import Playground from './views/Playground';
import Dev from './views/Dev';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          <Route exact path="/" component={Main} />
          <Route path="/dev" component={Dev} />
          <Route path="/Vote" component={Vote} />
          <Route path="/Playground" component={Playground} />
          <Redirect to="/" />
        </Switch>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
