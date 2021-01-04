import { Keyboard, Keys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.keyboard.HomeEndKeysTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [ Theme ], true);

  context('Home key', () => {
    it('Home key should move caret before cef within the same block', () => {
      const editor = hook.editor();
      editor.setContent('<p>123</p><p><span contenteditable="false">CEF</span>456</p>');
      TinySelections.setCursor(editor, [ 1, 1 ], 3);
      Keyboard.activeKeystroke(TinyDom.document(editor), Keys.home(), { });
      TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
    });

    it('Home key should move caret from after cef to before cef', () => {
      const editor = hook.editor();
      editor.setContent('<p><span contenteditable="false">CEF</span></p>');
      TinySelections.setCursor(editor, [ 0 ], 1);
      Keyboard.activeKeystroke(TinyDom.document(editor), Keys.home(), { });
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    });

    it('Home key should move caret to before cef from the start of range', () => {
      const editor = hook.editor();
      editor.setContent('<p>123</p><p><span contenteditable="false">CEF</span>456<br>789</p>');
      TinySelections.setSelection(editor, [ 1, 1 ], 3, [ 1, 1 ], 3);
      Keyboard.activeKeystroke(TinyDom.document(editor), Keys.home(), { });
      TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
    });

    it('Home key should not move caret before cef within the same block if there is a BR in between', () => {
      const editor = hook.editor();
      editor.setContent('<p>123</p><p><span contenteditable="false">CEF</span><br>456</p>');
      TinySelections.setCursor(editor, [ 1, 2 ], 3);
      Keyboard.activeKeystroke(TinyDom.document(editor), Keys.home(), { });
      TinyAssertions.assertSelection(editor, [ 1, 2 ], 3, [ 1, 2 ], 3);
    });

    it('Home key should not move caret if there is no cef', () => {
      const editor = hook.editor();
      editor.setContent('<p>123</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      Keyboard.activeKeystroke(TinyDom.document(editor), Keys.home(), { });
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    });

  });

  context('End key', () => {
    it('End key should move caret after cef within the same block', () => {
      const editor = hook.editor();
      editor.setContent('<p>123<span contenteditable="false">CEF</span></p><p>456</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      Keyboard.activeKeystroke(TinyDom.document(editor), Keys.end(), { });
      TinyAssertions.assertSelection(editor, [ 0, 2 ], 1, [ 0, 2 ], 1);
    });

    it('End key should move caret from before cef to after cef', () => {
      const editor = hook.editor();
      editor.setContent('<p><span contenteditable="false">CEF</span></p>');
      TinySelections.setCursor(editor, [ 0 ], 0);
      Keyboard.activeKeystroke(TinyDom.document(editor), Keys.end(), { });
      TinyAssertions.assertSelection(editor, [ 0, 1 ], 1, [ 0, 1 ], 1);
    });

    it('End key should move caret to after cef from the end of range', () => {
      const editor = hook.editor();
      editor.setContent('<p>123<br>456<span contenteditable="false">CEF</span></p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 2 ], 0);
      Keyboard.activeKeystroke(TinyDom.document(editor), Keys.end(), { });
      TinyAssertions.assertSelection(editor, [ 0, 4 ], 1, [ 0, 4 ], 1);
    });

    it('End key should not move caret after cef within the same block if there is a BR in between', () => {
      const editor = hook.editor();
      editor.setContent('<p>123<br><span contenteditable="false">CEF</span></p><p>456</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      Keyboard.activeKeystroke(TinyDom.document(editor), Keys.end(), { });
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    });

    it('End key should not move caret if there is no cef', () => {
      const editor = hook.editor();
      editor.setContent('<p>123</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      Keyboard.activeKeystroke(TinyDom.document(editor), Keys.end(), { });
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    });
  });
});
