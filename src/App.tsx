import React, {useState} from 'react';
import {QueryForm} from "./components/QueryForm";
import {IdeasForYou} from "./components/IdeasForYou";
import {sendDeleteSession, sendQuery} from "./services/ApiService";
import {Button, Card, Grid, Typography} from "@mui/material";
import {Header} from "./components/Header";
import {Conversation} from "./components/Conversation";
import {commonColors} from "./styles/styles";

export interface IChat {
    question: string,
    answer: string,
    sources: Source[]
}

export interface Source {
    URL?: string,
    title?: string;
}

function App() {
    const [persona, setPersona] = useState("none");
    const [inputQuery, setInputQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversation, setConversation] = useState<Array<IChat>>([]);

    const handleQueryWithText = (question: string) => {
        setInputQuery(question)
        handleQuery(question)
    }
    const handleQuery = (question: string) => {
        setConversation(conversation.concat({
            question: question,
            answer: "",
            sources: []
        }))
        setLoading(true)
        setInputQuery('')
        sendQuery(question, persona)
            .then((res) => {
                setConversation(conversation.concat({
                    question: question,
                    answer: res.response.result,
                    sources: res.response.sources
                }))
                localStorage.setItem("session_id", res.session_id)
                setLoading(false)
            })
            .catch((error) => {
                setConversation(conversation.concat({
                    question: question,
                    answer: "Received an error from the Knowledge Hub. Check the JS console.",
                    sources: []
                }))
                setLoading(false)
                console.error(error)
            });
    }
    const deleteSession = () => {
        setConversation([])
        sendDeleteSession().then((res) => {
            localStorage.removeItem("session_id")
        }).catch((error) => console.error(error))
    }

    return (
        <>
            <Header/>
            <Card sx={{
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'between',
                margin: 2,
                paddingTop: 2,
                paddingBottom: 2,
                borderRadius: '0.7rem',
            }}>
                <Grid container sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                }}>
                    {conversation.length === 0 ?
                        <IdeasForYou persona={persona}
                                     inputQuery={inputQuery}
                                     onSelectQuestion={(question: string) => handleQueryWithText(question)}
                        />
                        :
                        ""
                    }
                    <Grid item sx={{
                        maxHeight: '60vh',
                        overflow: "auto",
                        padding: 4,
                        width: 1
                    }}>
                        <Conversation conversation={conversation} loading={loading}/>
                    </Grid>
                    <Grid container item direction="row" justifyContent="center"
                          sx={{boxShadow: "0px -3px 5px 0px #0000001F", padding: "1rem"}}>
                        <Grid item xs={8}>
                            <QueryForm persona={persona}
                                       inputQuery={inputQuery}
                                       onPersonaChange={(newPersona: string) => setPersona(newPersona)}
                                       onInputQueryChange={(inputText: string) => setInputQuery(inputText)}
                                       onSubmit={() => handleQuery(inputQuery)}
                            />
                        </Grid>
                        <Grid item xs={1} sx={{
                            marginLeft: "10px",
                            borderRadius: "8"
                        }}>
                            <Button variant="outlined" sx={{
                                color: commonColors.purple600,
                                borderRadius: 5,
                                borderColor: commonColors.purple600
                            }}
                                    className="bg-focused-labs-brand-lighter-purple text-blue-dark font-semibold hover:bg-focused-labs-brand-light-purple py-2 px-4 border border-blue hover:border-transparent rounded"
                                    onClick={() => deleteSession()}>Clear Chat
                            </Button>
                        </Grid>
                    </Grid>
                    <Grid container direction={"row"} justifyContent={"center"}>
                        <Typography sx={{color: commonColors.darkGray, fontSize: "0.75rem", m: "1rem"}}>Please
                            don’t enter any personal
                            information since questions and responses are being logged. The FL KB Hub may produce
                            inaccurate information about people, places, or facts. </Typography>
                    </Grid>
                </Grid>
            </Card>
        </>
    );
}

export default App;
