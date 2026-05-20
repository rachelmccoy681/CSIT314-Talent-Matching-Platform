import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen';
import { useRouterContextState } from './lib/use-router-context-state';

import { useState, useEffect } from 'react'
import { supabase } from './utils/supabase'

const router = createRouter({
    routeTree,
    defaultPendingMs: 1000,
    defaultPreload: "intent",
    context:{
        role: null,
        login: () => {},
        logout: () => {},
        isAdmin: false,
        isClient: false,
        isAuthenticated: false
    }
});


declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

function App() {
    const routerContextState = useRouterContextState();

  return <RouterProvider router={router} context={routerContextState} />;
  
}

export default App
