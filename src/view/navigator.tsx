import * as React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';

import * as Immutable from 'immutable'

import * as Data from '../analysis/data'

import { Actions } from '../actions'
import { State } from '../state'

import ConversationDonut from './conversation-donut'
import ConversationsTimeline from './conversations-timeline'
import MessageCountTimeline from './message-count-timeline'
import Histogram from './histogram'
import Punchcard from './punchcard'
import Threads from './threads-list'

const styles = StyleSheet.create({
    noLeftPadding: {
        paddingLeft: "0px"
    }
});

interface StateProps {
    conversationLengths: Map<string, Map<number, number>>
    messageWordCounts: Map<string, Map<number, number>>
    threadDetails: Data.ThreadDetails
    wordcloudWords: Immutable.Map<number, string[]>
}

interface DispatchProps {
}

interface AppProps extends StateProps, DispatchProps {
}

const RenderNavigator = function({ threadDetails,
                                   conversationLengths,
                                   messageWordCounts,
                                   wordcloudWords
                                }: AppProps) {
    let detailsView = null;
    if (threadDetails) {
        // let wordcloud = null;
        // if (wordcloudWords.has(thread.id)) {
        //     wordcloud = (
        //         <WordCloud data={wordcloudWords.get(thread.id)} />
        //     );
        // }

        detailsView = (
            <div>
                <div>
                Messages written by:
                { threadDetails.messageCount.map((info, id) => {
                    const [author, count] = info;
                    return (<p key={id}>{author}: {count}</p>);
                    })
                }
                </div>
                <div>
                Conversations started by:
                { threadDetails.conversationStartCount.map((info, id) => {
                    const [author, count] = info;
                    return (<p key={id}>{author}: {count}</p>);
                    })
                }
                </div>
                <div>
                Last reply by:
                { threadDetails.conversationEndCount.map((info, id) => {
                    const [author, count] = info;
                    return (<p key={id}>{author}: {count}</p>);
                    })
                }
                </div>
            </div>
        );
    }
    return (
        <div className={"container-fluid " + css(styles.noLeftPadding)}>
            <div className={"col-md-2 " + css(styles.noLeftPadding)}>
                <Threads />
            </div>
            <div className="col-md-10">
                { detailsView }
                <MessageCountTimeline />
                <Punchcard />
                <ConversationsTimeline />
                <Histogram values={messageWordCounts} stacked={false} />
                <Histogram values={conversationLengths} stacked={true} />
            </div>
        </div>
    );
}

const mapStateToProps = function(state : State): StateProps {
    let threadDetails = null;
    if (state.selectedThreadIds.size === 1) {
        const selectedId = state.selectedThreadIds.first();
        if (state.threadDetails.has(selectedId)) {
            threadDetails = state.threadDetails.get(selectedId);
        }
    }
    return {
        conversationLengths: state.conversationLengths,
        messageWordCounts: state.messageWordCounts,
        threadDetails: threadDetails,
        wordcloudWords: state.wordcloudWords,
    };
}

const mapDispatchToProps = function(dispatch): DispatchProps {
    return {};
}

const Navigator = connect(mapStateToProps, mapDispatchToProps)(RenderNavigator)

export default Navigator