#!/usr/bin/env python3
"""Test script for Vocab Bubbles web application using Playwright."""

from playwright.sync_api import sync_playwright
import os

HTML_PATH = os.path.abspath('/home/hsik/Desktop/Projects/WordPuzzle/index.html')
SCREENSHOT_DIR = '/tmp/vocabbubbles_tests'

os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def test_page_loads():
    """Test 1: Page loads with gradient background and title."""
    print("\n=== Test 1: Page loads correctly ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(f'file://{HTML_PATH}')
        page.wait_for_load_state('networkidle')

        # Check title
        title = page.title()
        assert 'Vocab Bubbles' in title, f"Expected 'MoodWords' in title, got '{title}'"
        print(f"✓ Page title: {title}")

        # Check header is visible
        header = page.locator('h1')
        assert header.is_visible(), "Header should be visible"
        header_text = header.text_content()
        assert 'Vocab Bubbles' in header_text, f"Expected 'MoodWords' in header, got '{header_text}'"
        print(f"✓ Header text: {header_text}")

        # Check mood input section is visible
        mood_input = page.locator('#mood-input')
        assert mood_input.is_visible(), "Mood input should be visible"
        print("✓ Mood input is visible")

        # Check generate button is visible
        generate_btn = page.locator('#generate-btn')
        assert generate_btn.is_visible(), "Generate button should be visible"
        print("✓ Generate button is visible")

        # Take screenshot
        page.screenshot(path=f'{SCREENSHOT_DIR}/01_page_load.png', full_page=True)
        print(f"✓ Screenshot saved: {SCREENSHOT_DIR}/01_page_load.png")

        browser.close()
    print("=== Test 1 PASSED ===")


def test_api_key_prompt():
    """Test 2: API key prompt shows on first visit (no localStorage)."""
    print("\n=== Test 2: API key prompt behavior ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.goto(f'file://{HTML_PATH}')
        page.wait_for_load_state('networkidle')

        # API setup should be visible (no API key in localStorage)
        api_setup = page.locator('#api-setup')
        assert api_setup.is_visible(), "API setup should be visible on first visit"
        print("✓ API setup prompt is visible on first visit")

        # Take screenshot
        page.screenshot(path=f'{SCREENSHOT_DIR}/02_api_prompt.png', full_page=True)
        print(f"✓ Screenshot saved: {SCREENSHOT_DIR}/02_api_prompt.png")

        # Test saving API key
        api_input = page.locator('#api-key-input')
        api_input.fill('sk-ant-test-key-12345')
        page.locator('#save-api-key').click()

        # API setup should be hidden after saving
        page.wait_for_timeout(500)
        assert api_setup.is_hidden(), "API setup should be hidden after saving key"
        print("✓ API setup hidden after saving key")

        # Verify key is stored in localStorage
        stored_key = page.evaluate('() => localStorage.getItem("claude_api_key")')
        assert stored_key == 'sk-ant-test-key-12345', f"API key not stored correctly, got: {stored_key}"
        print("✓ API key stored in localStorage")

        browser.close()
    print("=== Test 2 PASSED ===")


def test_mood_input_validation():
    """Test 3: Error message when trying to generate without mood input."""
    print("\n=== Test 3: Mood input validation ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Set API key first
        page.goto(f'file://{HTML_PATH}')
        page.wait_for_load_state('networkidle')
        page.evaluate('() => localStorage.setItem("claude_api_key", "sk-ant-test")')
        page.reload()
        page.wait_for_load_state('networkidle')

        # Try to generate without entering mood
        generate_btn = page.locator('#generate-btn')
        generate_btn.click()

        # Error message should appear
        page.wait_for_timeout(500)
        error_msg = page.locator('#error-message')
        assert error_msg.is_visible(), "Error message should be visible"
        error_text = error_msg.text_content()
        assert 'mood' in error_text.lower(), f"Error should mention mood, got: {error_text}"
        print(f"✓ Error message shown: {error_text}")

        # Take screenshot
        page.screenshot(path=f'{SCREENSHOT_DIR}/03_validation_error.png', full_page=True)
        print(f"✓ Screenshot saved: {SCREENSHOT_DIR}/03_validation_error.png")

        browser.close()
    print("=== Test 3 PASSED ===")


def test_puzzle_generation_with_mock():
    """Test 4: Test puzzle display with mock data (bypass API)."""
    print("\n=== Test 4: Puzzle generation and display (mock) ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.goto(f'file://{HTML_PATH}')
        page.wait_for_load_state('networkidle')

        # Inject mock puzzle directly using the puzzle.js functions
        page.evaluate('''() => {
            // Generate a puzzle with test words
            const testWords = ["HAPPY", "JOY", "SMILE", "CALM"];
            currentPuzzle = generatePuzzle(testWords);
            foundWords = [];
            selectedCells = [];
            renderPuzzle();
            renderWordList();
            document.getElementById("game-section").classList.remove("hidden");
        }''')

        page.wait_for_timeout(500)

        # Check game section is visible
        game_section = page.locator('#game-section')
        assert game_section.is_visible(), "Game section should be visible"
        print("✓ Game section is visible")

        # Check grid has 100 cells (10x10)
        grid_cells = page.locator('.grid-cell')
        cell_count = grid_cells.count()
        assert cell_count == 100, f"Expected 100 grid cells, got {cell_count}"
        print(f"✓ Grid has {cell_count} cells (10x10)")

        # Check word list has items
        word_items = page.locator('.word-item')
        word_count = word_items.count()
        assert word_count > 0, "Word list should have items"
        print(f"✓ Word list has {word_count} words")

        # Take screenshot
        page.screenshot(path=f'{SCREENSHOT_DIR}/04_puzzle_display.png', full_page=True)
        print(f"✓ Screenshot saved: {SCREENSHOT_DIR}/04_puzzle_display.png")

        browser.close()
    print("=== Test 4 PASSED ===")


def test_cell_selection():
    """Test 5: Test clicking cells to select them."""
    print("\n=== Test 5: Cell selection interaction ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.goto(f'file://{HTML_PATH}')
        page.wait_for_load_state('networkidle')

        # Generate mock puzzle
        page.evaluate('''() => {
            const testWords = ["TEST"];
            currentPuzzle = generatePuzzle(testWords);
            foundWords = [];
            selectedCells = [];
            renderPuzzle();
            renderWordList();
            document.getElementById("game-section").classList.remove("hidden");
        }''')

        page.wait_for_timeout(500)

        # Click first cell
        first_cell = page.locator('.grid-cell').first
        first_cell.click()

        # Check cell has selected class
        assert 'selected' in first_cell.get_attribute('class'), "First cell should be selected"
        print("✓ First cell selected")

        # Click adjacent cell (second cell in first row)
        second_cell = page.locator('.grid-cell').nth(1)
        second_cell.click()

        # Both cells should be selected
        assert 'selected' in first_cell.get_attribute('class'), "First cell should still be selected"
        assert 'selected' in second_cell.get_attribute('class'), "Second cell should be selected"
        print("✓ Adjacent cell selection works")

        # Take screenshot
        page.screenshot(path=f'{SCREENSHOT_DIR}/05_cell_selection.png', full_page=True)
        print(f"✓ Screenshot saved: {SCREENSHOT_DIR}/05_cell_selection.png")

        # Click non-adjacent cell (should reset selection)
        non_adjacent = page.locator('.grid-cell').nth(50)  # Middle of grid
        non_adjacent.click()

        # First two cells should no longer be selected
        page.wait_for_timeout(200)
        first_class = first_cell.get_attribute('class') or ''
        assert 'selected' not in first_class, "First cell should be deselected after non-adjacent click"
        print("✓ Non-adjacent click resets selection")

        browser.close()
    print("=== Test 5 PASSED ===")


def test_word_finding():
    """Test 6: Test finding a word triggers correct behavior."""
    print("\n=== Test 6: Word finding and marking ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.goto(f'file://{HTML_PATH}')
        page.wait_for_load_state('networkidle')

        # Create a controlled puzzle where we know word positions
        page.evaluate('''() => {
            // Manually create a puzzle with known positions
            currentPuzzle = {
                grid: [
                    ['T', 'E', 'S', 'T', 'A', 'B', 'C', 'D', 'E', 'F'],
                    ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'],
                    ['Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
                    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
                    ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],
                    ['U', 'V', 'W', 'X', 'Y', 'Z', 'A', 'B', 'C', 'D'],
                    ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'],
                    ['O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'],
                    ['Y', 'Z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
                    ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R']
                ],
                words: ['TEST'],
                placements: [{
                    word: 'TEST',
                    positions: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}]
                }]
            };
            foundWords = [];
            selectedCells = [];
            renderPuzzle();
            renderWordList();
            document.getElementById("game-section").classList.remove("hidden");
        }''')

        page.wait_for_timeout(500)

        # Click T-E-S-T in order (first 4 cells)
        for i in range(4):
            cell = page.locator('.grid-cell').nth(i)
            cell.click()
            page.wait_for_timeout(100)

        page.wait_for_timeout(500)

        # Check cells are marked as found
        first_cell = page.locator('.grid-cell').first
        first_class = first_cell.get_attribute('class') or ''
        assert 'found' in first_class, "First cell should be marked as found"
        print("✓ Cells marked as found")

        # Check word item is marked as found
        word_item = page.locator('.word-item').first
        word_class = word_item.get_attribute('class') or ''
        assert 'found' in word_class, "Word item should be marked as found"
        print("✓ Word list item marked as found")

        # Take screenshot
        page.screenshot(path=f'{SCREENSHOT_DIR}/06_word_found.png', full_page=True)
        print(f"✓ Screenshot saved: {SCREENSHOT_DIR}/06_word_found.png")

        browser.close()
    print("=== Test 6 PASSED ===")


def test_celebration_modal():
    """Test 7: Test celebration modal when all words found."""
    print("\n=== Test 7: Celebration modal ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.goto(f'file://{HTML_PATH}')
        page.wait_for_load_state('networkidle')

        # Create puzzle and immediately mark all words as found
        page.evaluate('''() => {
            currentPuzzle = {
                grid: [
                    ['T', 'E', 'S', 'T', 'A', 'B', 'C', 'D', 'E', 'F'],
                    ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'],
                    ['Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
                    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
                    ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],
                    ['U', 'V', 'W', 'X', 'Y', 'Z', 'A', 'B', 'C', 'D'],
                    ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'],
                    ['O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'],
                    ['Y', 'Z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
                    ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R']
                ],
                words: ['TEST'],
                placements: [{
                    word: 'TEST',
                    positions: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}]
                }]
            };
            foundWords = [];
            selectedCells = [];
            renderPuzzle();
            renderWordList();
            document.getElementById("game-section").classList.remove("hidden");
        }''')

        page.wait_for_timeout(500)

        # Find the word (click T-E-S-T)
        for i in range(4):
            cell = page.locator('.grid-cell').nth(i)
            cell.click()
            page.wait_for_timeout(100)

        # Wait for celebration modal
        page.wait_for_timeout(1000)

        # Check celebration modal is visible
        modal = page.locator('#celebration-modal')
        modal_class = modal.get_attribute('class') or ''
        assert 'flex' in modal_class, "Celebration modal should be visible (flex)"
        print("✓ Celebration modal is visible")

        # Take screenshot
        page.screenshot(path=f'{SCREENSHOT_DIR}/07_celebration.png', full_page=True)
        print(f"✓ Screenshot saved: {SCREENSHOT_DIR}/07_celebration.png")

        # Test Play Again button
        play_again = page.locator('#play-again-btn')
        play_again.click()
        page.wait_for_timeout(500)

        # Modal should be hidden
        modal_class_after = modal.get_attribute('class') or ''
        assert 'hidden' in modal_class_after, "Modal should be hidden after Play Again"
        print("✓ Play Again button works")

        browser.close()
    print("=== Test 7 PASSED ===")


def test_new_puzzle_button():
    """Test 8: New Puzzle button resets the game."""
    print("\n=== Test 8: New Puzzle button ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.goto(f'file://{HTML_PATH}')
        page.wait_for_load_state('networkidle')

        # Generate mock puzzle
        page.evaluate('''() => {
            const testWords = ["TEST"];
            currentPuzzle = generatePuzzle(testWords);
            foundWords = [];
            selectedCells = [];
            renderPuzzle();
            renderWordList();
            document.getElementById("game-section").classList.remove("hidden");
        }''')

        page.wait_for_timeout(500)

        # Game section should be visible
        game_section = page.locator('#game-section')
        assert game_section.is_visible(), "Game section should be visible initially"

        # Click New Puzzle
        new_puzzle_btn = page.locator('#new-puzzle-btn')
        new_puzzle_btn.click()
        page.wait_for_timeout(500)

        # Game section should be hidden
        assert game_section.is_hidden(), "Game section should be hidden after New Puzzle"
        print("✓ Game section hidden after New Puzzle")

        # Mood input should be empty
        mood_input = page.locator('#mood-input')
        mood_value = mood_input.input_value()
        assert mood_value == '', f"Mood input should be empty, got: '{mood_value}'"
        print("✓ Mood input cleared")

        # Take screenshot
        page.screenshot(path=f'{SCREENSHOT_DIR}/08_new_puzzle.png', full_page=True)
        print(f"✓ Screenshot saved: {SCREENSHOT_DIR}/08_new_puzzle.png")

        browser.close()
    print("=== Test 8 PASSED ===")


def test_save_image_button_exists():
    """Test 9: Save as Image button exists and is clickable."""
    print("\n=== Test 9: Save as Image button ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.goto(f'file://{HTML_PATH}')
        page.wait_for_load_state('networkidle')

        # Generate mock puzzle
        page.evaluate('''() => {
            const testWords = ["TEST"];
            currentPuzzle = generatePuzzle(testWords);
            foundWords = [];
            selectedCells = [];
            renderPuzzle();
            renderWordList();
            document.getElementById("game-section").classList.remove("hidden");
        }''')

        page.wait_for_timeout(500)

        # Check Save Image button exists and is visible
        save_btn = page.locator('#save-image-btn')
        assert save_btn.is_visible(), "Save as Image button should be visible"
        print("✓ Save as Image button is visible")

        # Check button text
        btn_text = save_btn.text_content()
        assert 'Save' in btn_text or 'Image' in btn_text, f"Button text should mention saving image, got: {btn_text}"
        print(f"✓ Button text: {btn_text.strip()}")

        # Take screenshot
        page.screenshot(path=f'{SCREENSHOT_DIR}/09_save_button.png', full_page=True)
        print(f"✓ Screenshot saved: {SCREENSHOT_DIR}/09_save_button.png")

        browser.close()
    print("=== Test 9 PASSED ===")


def test_responsive_layout():
    """Test 10: Page renders correctly at different viewport sizes."""
    print("\n=== Test 10: Responsive layout ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        viewports = [
            {'width': 1920, 'height': 1080, 'name': 'desktop'},
            {'width': 768, 'height': 1024, 'name': 'tablet'},
            {'width': 375, 'height': 667, 'name': 'mobile'}
        ]

        for vp in viewports:
            context = browser.new_context(viewport={'width': vp['width'], 'height': vp['height']})
            page = context.new_page()
            page.goto(f'file://{HTML_PATH}')
            page.wait_for_load_state('networkidle')

            # Generate mock puzzle for full view
            page.evaluate('''() => {
                const testWords = ["TEST", "HAPPY"];
                currentPuzzle = generatePuzzle(testWords);
                foundWords = [];
                selectedCells = [];
                renderPuzzle();
                renderWordList();
                document.getElementById("game-section").classList.remove("hidden");
            }''')

            page.wait_for_timeout(500)

            # Check header is visible
            header = page.locator('h1')
            assert header.is_visible(), f"Header should be visible at {vp['name']}"

            # Check grid is visible
            grid = page.locator('#puzzle-grid')
            assert grid.is_visible(), f"Grid should be visible at {vp['name']}"

            # Take screenshot
            page.screenshot(path=f'{SCREENSHOT_DIR}/10_responsive_{vp["name"]}.png', full_page=True)
            print(f"✓ {vp['name'].capitalize()} ({vp['width']}x{vp['height']}): Layout renders correctly")

            context.close()

        browser.close()
    print("=== Test 10 PASSED ===")


if __name__ == '__main__':
    print("=" * 60)
    print("Vocab Bubbles Web Application Tests")
    print("=" * 60)

    tests = [
        test_page_loads,
        test_api_key_prompt,
        test_mood_input_validation,
        test_puzzle_generation_with_mock,
        test_cell_selection,
        test_word_finding,
        test_celebration_modal,
        test_new_puzzle_button,
        test_save_image_button_exists,
        test_responsive_layout,
    ]

    passed = 0
    failed = 0

    for test in tests:
        try:
            test()
            passed += 1
        except AssertionError as e:
            print(f"=== FAILED: {e} ===")
            failed += 1
        except Exception as e:
            print(f"=== ERROR: {e} ===")
            failed += 1

    print("\n" + "=" * 60)
    print(f"RESULTS: {passed} passed, {failed} failed out of {len(tests)} tests")
    print(f"Screenshots saved to: {SCREENSHOT_DIR}")
    print("=" * 60)
