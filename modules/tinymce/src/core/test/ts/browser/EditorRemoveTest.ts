import { before, describe, it } from '@ephox/bedrock-client';
import { Editor as McEditor } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.EditorRemoveTest', () => {
  before(() => Theme());

  const settings = {
    base_url: '/project/tinymce/js/tinymce'
  };

  const assertTextareaDisplayStyle = (editor: Editor, expected: string) => {
    const textareaElement = editor.getElement();
    assert.equal(textareaElement.style.display, expected, 'element does not have the expected style');
  };

  const testRemoveStyles = (editor: Editor, expectedStyle: string) => {
    assertTextareaDisplayStyle(editor, 'none');
    editor.remove();
    assertTextareaDisplayStyle(editor, expectedStyle);
    EditorManager.init({ selector: '#tinymce' });
    assertTextareaDisplayStyle(editor, expectedStyle);
    McEditor.remove(editor);
  };

  it('remove editor without initializing it', () => {
    const editor = new Editor('editor', {}, EditorManager);
    editor.remove();
  });

  it('remove editor where the body has been removed', async () => {
    const editor = await McEditor.pFromHtml<Editor>('<textarea></textarea>', settings);
    const body = editor.getBody();
    body.parentNode.removeChild(body);
    McEditor.remove(editor);
  });

  it('init editor with no display style', async () => {
    const editor = await McEditor.pFromHtml<Editor>('<textarea id="tinymce"></textarea>', settings);
    testRemoveStyles(editor, '');
  });

  it('init editor with display: none', async () => {
    const editor = await McEditor.pFromHtml<Editor>('<textarea id="tinymce" style="display: none;"></textarea>', settings);
    testRemoveStyles(editor, 'none');
  });

  it('init editor with display: block', async () => {
    const editor = await McEditor.pFromHtml<Editor>('<textarea id="tinymce" style="display: block;"></textarea>', settings);
    testRemoveStyles(editor, 'block');
  });
});
