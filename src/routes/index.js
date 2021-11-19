import React from 'react'
import { Redirect } from "react-router-dom";
import Home from '../page/Home';
import Tube from '../page/Tube'
import TubeRoom from '../page/TubeRoom';
export default [
    {
        path: "/",
        component: Home,
        routes: [
            {
                path: "/",
                exact: true,
                component: Home,
                render: ()=>
                (<Redirect to={"/tube"}/>)
            },
            {
                path: "/tube",
                component: Tube,
                routes:[
                    {
                        path: "/tube/:id",
                        component: TubeRoom
                    }
                ]
            },
        ]
    }, 
]