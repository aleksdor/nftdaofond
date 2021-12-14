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
import GreenHouse from './views/GreenHouse';
import Dev from './views/Dev';
import CreateProposal from './views/CreateProposal';
import Test from './views/Test';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          <Route exact path="/" component={Main} />
          <Route path="/dev" component={Dev} />
          <Route path="/vote" component={Vote} />
          <Route path="/greenhouse" component={GreenHouse} />
          <Route path="/create-proposal" component={CreateProposal} />
          <Route path="/test" component={Test} />
          <Redirect to="/" />
        </Switch>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
