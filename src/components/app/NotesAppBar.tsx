import {
    AppBar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    TextField,
    Toolbar,
    Typography
} from "@mui/material";
import React, {useEffect, useRef, useState} from "react";
import {AccountCircle} from "@mui/icons-material";
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import NotesIcon from '@mui/icons-material/Notes';
import AddIcon from '@mui/icons-material/Add';
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../redux/store";
import {setAuthToken, setUser} from "../../redux/accountState";
import CurrentUser from "../../types/current_user";
import {setCurrent, updateNote} from "../../redux/notesState";
import Note from "../../types/note";

const drawerWidth = 240;


export default function NotesAppBar() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dialogType, setDialogType] = useState<"login" | "register" | null>(null);
    const nameRef = useRef<HTMLInputElement | null>(null);
    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const noteRef = useRef<HTMLInputElement | null>(null);
    const token = useSelector((state: RootState) => state.account.token);
    const me = useSelector((state: RootState) => state.account.me);
    const notes = useSelector((state: RootState) => state.notes.by_id);
    const note = useSelector((state: RootState) => state.notes.current ? state.notes.by_id[state.notes.current] : null);
    const loggedIn = Boolean(token);
    const dispatch = useDispatch();
    const [createOpen, setCreateOpen] = useState(false);

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleLoginClose = () => setDialogType(null);
    const createClose = () => setCreateOpen(false);
    const loadNotes = (token_?: string | undefined) => {
        (loggedIn || Boolean(token_)) && fetch("http://127.0.0.1:8000/api/v1/notes?with_content=true", {
            headers: {"Authorization": (token || token_)!}
        }).then(r => {
            if(r.status === 200) {
                r.json().then(j => {
                    let first = true;
                    for(let note of j as Note[]) {
                        dispatch(updateNote(note));
                        if(first) {
                            dispatch(setCurrent(note.id));
                            first = false;
                        }
                    }
                });
            }
        });
    }
    const loadUser = () => {
        loggedIn && fetch("http://127.0.0.1:8000/api/v1/me", {
            headers: {"Authorization": token!}
        }).then(r => {
            if(r.status === 200) {
                r.json().then(j => {
                    dispatch(setUser(j as CurrentUser));
                });
            }
        });
    }
    const processLogin = () => {
        const email = emailRef.current!.value;
        const password = passwordRef.current!.value;
        if (!email || !password) return;

        fetch("http://127.0.0.1:8000/api/v1/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        }).then(r => {
            if(r.status === 200) {
                r.json().then(j => {
                    dispatch(setAuthToken(j["token"] as string));
                    dispatch(setUser(j["user"] as CurrentUser));
                    loadNotes(j["token"]);
                });
            }
            handleLoginClose();
        });
    };
    const processRegister = () => {
        const name = nameRef.current!.value;
        const email = emailRef.current!.value;
        const password = passwordRef.current!.value;
        if (!email || !password || !name) return;

        fetch("http://127.0.0.1:8000/api/v1/auth/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
            }),
        }).then(r => {
            if(r.status === 200) {
                r.json().then(j => {
                    dispatch(setAuthToken(j["token"] as string));
                    dispatch(setUser(j["user"] as CurrentUser));
                });
            }
            handleLoginClose();
        });
    };
    const processCreate = () => {
        const name = noteRef.current?.value;

        loggedIn && fetch("http://127.0.0.1:8000/api/v1/notes", {
            method: "POST",
            headers: {"Authorization": token!, "Content-Type": "application/json"},
            body: JSON.stringify({"name": name ? name : null}),
        }).then(r => {
            if(r.status === 200) {
                r.json().then(j => {
                    dispatch(updateNote(j as Note));
                    dispatch(setCurrent((j as Note).id));
                    createClose();
                    setMobileOpen(false);
                });
            }
        });
    };

    useEffect(() => {
        loadUser();
        loadNotes();
    }, []);

    const drawer = (
        <div>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>Notes</Typography>
            </Toolbar>
            <Divider />
            <List>
                {Object.values(notes).map((note) => (
                    <ListItem key={note.id} disablePadding>
                        <ListItemButton onClick={() => {
                            dispatch(setCurrent(note.id));
                            setMobileOpen(false);
                        }}>
                            <ListItemIcon>
                                <NotesIcon />
                            </ListItemIcon>
                            <ListItemText primary={note.name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            {loggedIn && [
                <Divider />,
                <List>
                    <ListItem key="Create New" disablePadding>
                        <ListItemButton onClick={() => setCreateOpen(true)}>
                            <ListItemIcon>
                                <AddIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Create New"/>
                        </ListItemButton>
                    </ListItem>
                </List>
            ]}
        </div>
    );

    const loginDialog = (
        <Dialog open={Boolean(dialogType)} onClose={handleLoginClose}>
            <DialogTitle>{dialogType === "login" ? "Log in" : "Register"}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {dialogType === "login"
                        ? "To sync your notes between multiple devices, you need to log in your account."
                        : "Create an account to sync your notes between multiple devices." }
                </DialogContentText>
                {dialogType === "login"
                    ? (<>
                        <TextField autoFocus margin="dense" label="Email Address" type="email" fullWidth variant="standard" inputRef={emailRef}/>
                        <TextField margin="dense" label="Password" type="password" fullWidth variant="standard" inputRef={passwordRef}/>
                    </>)
                    : (<>
                        <TextField autoFocus margin="dense" label="Name" type="text" fullWidth variant="standard" inputRef={nameRef}/>
                        <TextField margin="dense" label="Email Address" type="email" fullWidth variant="standard" inputRef={emailRef}/>
                        <TextField margin="dense" label="Password" type="password" fullWidth variant="standard" inputRef={passwordRef}/>
                    </>) }


                <DialogContentText>
                    {dialogType === "login"
                        ? <>Don't have an account? <a href="#" onClick={() => setDialogType("register")}>Register</a></>
                        : <>Already have an account? <a href="#" onClick={() => setDialogType("login")}>Log in</a></> }

                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleLoginClose}>Cancel</Button>
                {dialogType === "login"
                    ? <Button onClick={processLogin}>Log in</Button>
                    : <Button onClick={processRegister}>Register</Button> }
            </DialogActions>
        </Dialog>
    );

    const noteCreateDialog = (
        <Dialog open={createOpen} onClose={createClose}>
            <DialogTitle>Create new note</DialogTitle>
            <DialogContent>
                <TextField autoFocus margin="dense" label="Name (Optional)" type="text" fullWidth variant="standard" inputRef={noteRef}/>
            </DialogContent>
            <DialogActions>
                <Button onClick={createClose}>Cancel</Button>
                <Button onClick={processCreate}>Create</Button>
            </DialogActions>
        </Dialog>
    );

    return (<>
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                        <MenuIcon onClick={handleDrawerToggle}/>
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>{note ? note.name : "Notes"}</Typography>
                    <IconButton size="large" onClick={handleMenu} color="inherit">
                        <AccountCircle />
                    </IconButton>
                    <Menu anchorEl={anchorEl} anchorOrigin={{vertical: 'top', horizontal: 'right'}} keepMounted
                          transformOrigin={{vertical: 'top', horizontal: 'right'}} open={Boolean(anchorEl)}
                          onClose={handleClose}>
                        {loggedIn
                            ? [
                                <MenuItem disabled={true}>Hi, {me.name}</MenuItem>,
                                <MenuItem onClick={() => {setCreateOpen(true); handleClose();}}>New note</MenuItem>,
                                <MenuItem onClick={() => {dispatch(setAuthToken(null)); handleClose();}}>Log out</MenuItem>,
                            ]
                            : <MenuItem onClick={() => {setDialogType("login"); handleClose();}}>Log in</MenuItem>}

                    </Menu>
                </Toolbar>
            </AppBar>
        </Box>

        <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
            <Drawer container={() => window.document.body} variant="temporary" open={mobileOpen}
                    onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }}
                sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }}}>
                {drawer}
            </Drawer>
        </Box>

        {loginDialog}
        {noteCreateDialog}
    </>);
}