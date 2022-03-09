import React from 'react';
import {
  BrowserRouter,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import Layout from './route/Layout';
import Main from './views/Main';
import Proposals from './views/Proposals';
import GreenHouse from './views/GreenHouse';
import Dev from './views/Dev';
import CreateProposal from './views/CreateProposal';
import Vote from './views/Vote';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';
import { useState } from 'react';

function App() {

  const [miningProposals, setMiningProposals] = useState([])

  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          <Route exact path="/" component={Main} />
          <Route path="/dev" component={Dev} />
          <Route path="/votes" render={(props) => <Proposals miningProposals={miningProposals} setMiningProposals={setMiningProposals} {...props} />} />
          <Route path="/greenhouse" component={GreenHouse} />
          <Route path="/create-proposal" render={(props) => <CreateProposal miningProposals={miningProposals} setMiningProposals={setMiningProposals} {...props} />} />
          <Route path="/vote/:id" component={Vote} />
          <Redirect to="/" />
        </Switch>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
