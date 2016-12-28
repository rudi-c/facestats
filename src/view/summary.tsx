import * as React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button } from 'react-bootstrap'

import { Actions } from '../actions'
import { State } from '../state'

import ConversationDonut from './conversation-donut'
import MessageCountTimeline from './message-count-timeline'
import Punchcard from './punchcard'
import Threads from './threads-list'

const styles = StyleSheet.create({
    view: {
        width: '1000px'
    },
});

interface StateProps {
}

interface DispatchProps {
    onNext: (any) => any
}

interface AppProps extends StateProps, DispatchProps {
}

const RenderSummary = function({ onNext }: AppProps) {
    return (
        <div className={"container " + css(styles.view)}>
            <ConversationDonut />
            <MessageCountTimeline />
            <Punchcard />
            <Button bsStyle="primary" onClick={onNext}>Continue...</Button>
        </div>
    );
}

const mapStateToProps = function(state : State): StateProps {
    return {};
}

const mapDispatchToProps = function(dispatch): DispatchProps {
    return {
        onNext: () => {
            dispatch(Actions.moveToNavigator());
        },
    };
}

const Summary = connect(mapStateToProps, mapDispatchToProps)(RenderSummary)

export default Summary