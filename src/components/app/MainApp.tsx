import NotesAppBar from "./NotesAppBar";
import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    CreateLink,
    diffSourcePlugin,
    headingsPlugin,
    imagePlugin,
    InsertCodeBlock,
    InsertImage,
    InsertTable,
    InsertThematicBreak,
    linkDialogPlugin,
    linkPlugin,
    listsPlugin,
    ListsToggle,
    MDXEditor,
    MDXEditorMethods,
    quotePlugin,
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    UndoRedo,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import "../../styles/app.css";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../redux/store";
import {useEffect, useRef} from "react";
import {updateNote} from "../../redux/notesState";
import Note from "../../types/note";
import {debounce} from "ts-debounce";

export default function MainApp() {
    const note = useSelector((state: RootState) => state.notes.current ? state.notes.by_id[state.notes.current] : null);
    const mdxEditorRef = useRef<MDXEditorMethods>(null);
    const token = useSelector((state: RootState) => state.account.token);
    const dispatch = useDispatch();

    useEffect(() => {
        note && token && fetch(`http://127.0.0.1:8000/api/v1/notes/${note.id}`, {
            headers: {"Authorization": token}
        }).then(r => {
            r.status === 200 && r.json().then(j => dispatch(updateNote(j as Note)));
        });
    }, [note]);

    useEffect(() => {
        note?.text && mdxEditorRef.current && mdxEditorRef.current.setMarkdown(note?.text);
    }, [note?.text]);

    const save_ = (note_id: number | undefined) => (md: string) => {
        note_id && token && fetch(`http://127.0.0.1:8000/api/v1/notes/${note_id}`, {
            method: "PUT",
            headers: {"Authorization": token, "Content-Type": "application/json"},
            body: JSON.stringify({"text": md}),
        }).then();
        console.log(md);
    }
    const save = debounce(save_(note?.id), 500);

    const toolbar = (<>
        <UndoRedo />
        <BoldItalicUnderlineToggles />

        <ListsToggle />

        <BlockTypeSelect />

        <CreateLink />
        <InsertImage />

        <InsertTable />
        <InsertThematicBreak />

        <InsertCodeBlock />
    </>);

    const plugins = [
        headingsPlugin(), quotePlugin(), listsPlugin(), thematicBreakPlugin(), linkDialogPlugin(), diffSourcePlugin(),
        imagePlugin(), tablePlugin(), linkPlugin(),
        toolbarPlugin({toolbarContents: () => toolbar}),
    ];

    /*
    const diff = createTwoFilesPatch("s", "s", "test yep\n\n123\n\nyep", "test 123\n\n123\n\ntest");
    const comp = compress(diff, {outputEncoding: "Base64"});

    console.log(comp); // check what has less size, send to server smaller data
    */

    return (<>
        <NotesAppBar/>
        <div className="main-content">
            <MDXEditor markdown="" placeholder="Write here..." className="editor" plugins={plugins} onChange={save} ref={mdxEditorRef}/>
        </div>
    </>);
}