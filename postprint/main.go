package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"log/slog"
	"math"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strings"
	"time"

	"github.com/alecthomas/kong"
	"github.com/charmbracelet/bubbles/list"
	"github.com/charmbracelet/bubbles/spinner"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/playwright-community/playwright-go"
)

const (
	productionHost   = "smallerworld.club"
	localHost        = "localhost"
	pollInterval     = time.Second
	postCardSelector = ".PostCard"
)

type mode int

const (
	modePost mode = iota
	modeSpace
)

type step int

const (
	stepMode step = iota
	stepSpaceInput
	stepPostInput
	stepPrinter
	stepRun
	stepDone
	stepError
)

type cli struct {
	Debug bool `help:"Enable debug logging."`
	Local bool `help:"Use http://localhost:3000 as base."`
}

type post struct {
	ID         string `json:"id"`
	AuthorName string `json:"author_name"`
	Snippet    string `json:"snippet"`
	CreatedAt  string `json:"created_at"`
	Type       string `json:"type"`
}

type postsResponse struct {
	Posts []post `json:"posts"`
}

type printerChoice struct {
	title       string
	description string
	printerName string
	saveOnly    bool
	cancel      bool
}

func (p *printerChoice) Title() string       { return p.title }
func (p *printerChoice) Description() string { return p.description }
func (p *printerChoice) FilterValue() string { return p.title }

type modeChoiceItem struct {
	title string
	mode  mode
}

func (m modeChoiceItem) Title() string       { return m.title }
func (m modeChoiceItem) Description() string { return "" }
func (m modeChoiceItem) FilterValue() string { return m.title }

type runStage int

type runModel struct {
	ctx          context.Context
	cancel       context.CancelFunc
	step         step
	mode         mode
	base         string
	targetID     string
	printer      printerChoice
	downloadsDir string
	debug        bool

	list       list.Model
	input      textinput.Model
	inputLabel string
	inputErr   string
	spinner    spinner.Model

	status string
	logs   []string
	err    error

	pw      *playwright.Playwright
	browser playwright.Browser
	client  *http.Client

	seen   map[string]struct{}
	latest time.Time
	queue  []post
}

type debugMsg struct{ line string }

type itemWithDesc interface {
	Title() string
	Description() string
}

type compactDelegate struct {
	showDescription bool
}

func newCompactDelegate(showDescription bool) compactDelegate {
	return compactDelegate{showDescription: showDescription}
}

func (d compactDelegate) Height() int {
	if d.showDescription {
		return 2
	}
	return 1
}

func (d compactDelegate) Spacing() int { return 0 }

func (d compactDelegate) Update(msg tea.Msg, m *list.Model) tea.Cmd { return nil }

func (d compactDelegate) Render(w io.Writer, m list.Model, index int, listItem list.Item) {
	item, ok := listItem.(itemWithDesc)
	if !ok {
		return
	}
	cursor := "  "
	if index == m.Index() {
		cursor = "> "
	}
	fmt.Fprintf(w, "%s%s\n", cursor, item.Title())
	if d.showDescription {
		desc := strings.TrimSpace(item.Description())
		if desc != "" {
			fmt.Fprintf(w, "    %s\n", desc)
		}
	}
}

type launchedMsg struct {
	pw      *playwright.Playwright
	browser playwright.Browser
	err     error
}

type renderMsg struct {
	postID  string
	pdfPath string
	width   int
	height  int
	err     error
}

type printMsg struct {
	postID  string
	printer string
	err     error
}

type spaceInitMsg struct {
	posts []post
	err   error
}

type pollMsg struct {
	posts []post
	err   error
}

type processMsg struct {
	post      post
	pdfPath   string
	printed   bool
	printErr  error
	renderErr error
}

type tickMsg struct{}

func main() {
	var cliArgs cli
	kctx := kong.Parse(&cliArgs)
	kctx.Validate()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	downloadsDir, err := defaultDownloadsDir()
	if err != nil {
		log.Fatalf("could not resolve downloads directory: %v", err)
	}
	if err := os.MkdirAll(downloadsDir, 0o755); err != nil {
		log.Fatalf("could not create downloads directory: %v", err)
	}

	printers, err := listPrinters(ctx, func(string, ...any) {})
	if err != nil && cliArgs.Debug {
		log.Printf("[debug] printer discovery failed: %v", err)
	}

	m := initialModel(ctx, downloadsDir, printers, cliArgs.Debug, cliArgs.Local)
	p := tea.NewProgram(m, tea.WithContext(ctx))
	if _, err := p.Run(); err != nil {
		log.Fatalf("postprint error: %v", err)
	}
}

func initialModel(ctx context.Context, downloadsDir string, printers []string, debug bool, local bool) runModel {
	cctx, cancel := context.WithCancel(ctx)
	modeItems := []list.Item{
		modeChoiceItem{title: "Watch a space (print new posts as they arrive)", mode: modeSpace},
		modeChoiceItem{title: "Print a single post (by ID)", mode: modePost},
	}
	modeDelegate := newCompactDelegate(false)
	modeList := list.New(modeItems, modeDelegate, 60, 10)
	modeList.Title = "What do you want to do?"
	modeList.SetFilteringEnabled(false)
	modeList.SetShowStatusBar(false)
	modeList.SetShowHelp(false)
	modeList.SetShowPagination(false)
	modeList.Select(0)

	ti := textinput.New()
	ti.CharLimit = 256
	ti.Width = 60
	ti.Prompt = "> "
	ti.Placeholder = ""

	sp := spinner.New()
	sp.Spinner = spinner.Dot

	return runModel{
		ctx:          cctx,
		cancel:       cancel,
		step:         stepMode,
		downloadsDir: downloadsDir,
		debug:        debug,
		base:         defaultBase(local),
		list:         modeList,
		input:        ti,
		inputLabel:   "",
		spinner:      sp,
	}
}

func (m runModel) Init() tea.Cmd {
	return tea.Batch(m.spinner.Tick, debugListener())
}

func (m runModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		return m.updateKey(msg)
	case launchedMsg:
		return m.handleLaunched(msg)
	case renderMsg:
		return m.handleRender(msg)
	case printMsg:
		return m.handlePrint(msg)
	case spaceInitMsg:
		return m.handleSpaceInit(msg)
	case pollMsg:
		return m.handlePoll(msg)
	case processMsg:
		return m.handleProcess(msg)
	case tickMsg:
		return m.handleTick()
	case debugMsg:
		m.logs = append(m.logs, msg.line)
		return m, debugListener()
	}

	var cmd tea.Cmd
	m.spinner, cmd = m.spinner.Update(msg)
	return m, cmd
}

func (m runModel) View() string {
	switch m.step {
	case stepMode, stepPrinter:
		return lipgloss.NewStyle().Margin(1, 0).Render(m.list.View())
	case stepSpaceInput, stepPostInput:
		label := strings.TrimSpace(m.inputLabel)
		var errLine string
		if m.inputErr != "" {
			errLine = "\n\n" + m.inputErr
		}
		return lipgloss.NewStyle().Margin(1, 0).Render(fmt.Sprintf("%s\n\n%s%s", label, m.input.View(), errLine))
	case stepRun, stepDone, stepError:
		var b strings.Builder
		b.WriteString("\n")
		if m.step == stepRun {
			b.WriteString(fmt.Sprintf("%s %s\n\n", m.spinner.View(), m.status))
		} else {
			b.WriteString(fmt.Sprintf("%s\n\n", m.status))
		}
		for _, line := range m.trimmedLogs() {
			b.WriteString(line)
			b.WriteByte('\n')
		}
		if m.err != nil {
			b.WriteString(fmt.Sprintf("\nerror: %v\n", m.err))
		}
		return b.String()
	default:
		return ""
	}
}

func (m runModel) trimmedLogs() []string {
	const maxLines = 20
	if len(m.logs) <= maxLines {
		return m.logs
	}
	return m.logs[len(m.logs)-maxLines:]
}

func (m runModel) updateKey(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	switch m.step {
	case stepMode:
		switch msg.String() {
		case "q", "ctrl+c":
			return m, tea.Quit
		case "enter":
			if item, ok := m.list.SelectedItem().(modeChoiceItem); ok {
				m.mode = item.mode
				if m.mode == modeSpace {
					m.step = stepSpaceInput
					m.input.Reset()
					m.input.SetValue("")
					m.input.Placeholder = "https://smallerworld.club/spaces/cozy-hut-abcdef0123456789abcdef0123456789"
					m.input.Prompt = "Space: "
					m.inputLabel = "Enter space URL / friendly ID / ID"
					m.input.Focus()
				} else {
					m.step = stepPostInput
					m.input.Reset()
					m.input.SetValue("")
					m.input.Placeholder = "123e4567-e89b-12d3-a456-426614174000"
					m.input.Prompt = "Post: "
					m.inputLabel = "Enter post ID (UUID)"
					m.input.Focus()
				}
				return m, nil
			}
		}
		var cmd tea.Cmd
		m.list, cmd = m.list.Update(msg)
		return m, cmd
	case stepSpaceInput, stepPostInput:
		switch msg.String() {
		case "q", "ctrl+c":
			return m, tea.Quit
		case "enter":
			value := strings.TrimSpace(m.input.Value())
			if value == "" {
				m.inputErr = "Input cannot be empty"
				return m, nil
			}
			if m.step == stepSpaceInput {
				base, id, err := resolveSpaceInput(value)
				if err != nil {
					m.inputErr = fmt.Sprintf("Invalid space input: %v", err)
					return m, nil
				}
				m.base = base
				m.targetID = id
			} else {
				m.base = defaultBase(false)
				m.targetID = value
			}
			m.inputErr = ""
			m.step = stepPrinter
			m.list = buildPrinterList(m.ctx, m.debug)
			return m, nil
		}
		m.inputErr = ""
		var cmd tea.Cmd
		m.input, cmd = m.input.Update(msg)
		return m, cmd
	case stepPrinter:
		switch msg.String() {
		case "q", "ctrl+c":
			return m, tea.Quit
		case "enter":
			if item, ok := m.list.SelectedItem().(*printerChoice); ok {
				if item.cancel {
					return m, tea.Quit
				}
				if !item.saveOnly {
					m.printer = *item
				}
				m.step = stepRun
				m.status = "Downloading Playwright (first run ~200MB) / Launching Chromium"
				return m, tea.Batch(m.spinner.Tick, launchCmd(m.ctx, debugFn(m.debug)))
			}
		}
		var cmd tea.Cmd
		m.list, cmd = m.list.Update(msg)
		return m, cmd
	case stepRun, stepDone, stepError:
		if msg.String() == "q" || msg.String() == "ctrl+c" {
			return m, tea.Quit
		}
	}

	var cmd tea.Cmd
	m.spinner, cmd = m.spinner.Update(msg)
	return m, cmd
}

func (m runModel) handleLaunched(msg launchedMsg) (tea.Model, tea.Cmd) {
	if msg.err != nil {
		m.err = msg.err
		m.status = "Failed to start Playwright"
		m.step = stepError
		return m, nil
	}
	m.pw = msg.pw
	m.browser = msg.browser
	m.client = &http.Client{Timeout: 15 * time.Second}
	m.addLog("Playwright ready")

	if m.mode == modePost {
		m.status = "Rendering post"
		return m, tea.Batch(m.spinner.Tick, renderCmd(m.ctx, m.browser, m.downloadsDir, m.base, m.targetID, debugFn(m.debug)))
	}

	m.status = "Syncing space"
	return m, tea.Batch(m.spinner.Tick, spaceInitCmd(m.ctx, m.client, m.base, m.targetID, debugFn(m.debug)))
}

func (m runModel) handleRender(msg renderMsg) (tea.Model, tea.Cmd) {
	if msg.err != nil {
		m.err = msg.err
		m.status = "Render failed"
		m.step = stepError
		m.cancel()
		return m, tea.Quit
	}
	m.addLog(msg.pdfPath)
	if m.mode == modePost {
		if m.printer.printerName != "" {
			m.status = "Printing"
			return m, tea.Batch(m.spinner.Tick, printCmd(m.ctx, m.printer.printerName, msg.pdfPath, msg.width, msg.height, debugFn(m.debug)))
		}
		m.status = "Done"
		m.step = stepDone
		m.cancel()
		return m, tea.Quit
	}
	// For space mode, render is triggered via processMsg flow; should not hit here.
	return m, nil
}

func (m runModel) handlePrint(msg printMsg) (tea.Model, tea.Cmd) {
	if msg.err != nil {
		m.err = msg.err
		m.status = "Print failed"
		m.step = stepError
		m.cancel()
		return m, tea.Quit
	}
	m.addLog(fmt.Sprintf("[print] Sent to %s", msg.printer))
	m.status = "Done"
	m.step = stepDone
	m.cancel()
	return m, tea.Quit
}

func (m runModel) handleSpaceInit(msg spaceInitMsg) (tea.Model, tea.Cmd) {
	if msg.err != nil {
		m.err = msg.err
		m.status = "Initial sync failed"
		m.step = stepError
		m.cancel()
		return m, tea.Quit
	}
	m.seen = make(map[string]struct{})
	for _, p := range msg.posts {
		m.seen[p.ID] = struct{}{}
		if t, err := time.Parse(time.RFC3339, p.CreatedAt); err == nil {
			if m.latest.IsZero() || t.After(m.latest) {
				m.latest = t
			}
		}
	}
	m.addLog(fmt.Sprintf("Tracking %d existing posts.", len(msg.posts)))
	m.status = "Watching for new posts..."
	return m, tea.Tick(pollInterval, func(time.Time) tea.Msg { return tickMsg{} })
}

func (m runModel) handlePoll(msg pollMsg) (tea.Model, tea.Cmd) {
	if msg.err != nil && m.debug {
		m.addLog(fmt.Sprintf("[debug] polling error: %v", msg.err))
	}
	newPosts := filterNewPosts(msg.posts, m.seen, &m.latest)
	if len(newPosts) == 0 {
		return m, tea.Tick(pollInterval, func(time.Time) tea.Msg { return tickMsg{} })
	}
	// Oldest first
	for i, j := 0, len(newPosts)-1; i < j; i, j = i+1, j-1 {
		newPosts[i], newPosts[j] = newPosts[j], newPosts[i]
	}
	// Log each discovered post
	for _, p := range newPosts {
		firstLine := strings.SplitN(p.Snippet, "\n", 2)[0]
		if len(firstLine) > 60 {
			firstLine = firstLine[:57] + "..."
		}
		m = m.addLog(fmt.Sprintf("New post from %s: %s [%s]", p.AuthorName, firstLine, p.ID))
	}
	m.queue = append(m.queue, newPosts...)
	m.status = fmt.Sprintf("Rendering %d new post(s)", len(m.queue))
	return m, tea.Batch(m.spinner.Tick, processPostCmd(m.ctx, m.browser, m.downloadsDir, m.base, m.queue[0], m.printer.printerName, debugFn(m.debug)))
}

func (m runModel) handleProcess(msg processMsg) (tea.Model, tea.Cmd) {
	if msg.renderErr != nil {
		m.addLog(fmt.Sprintf("[error] render %s: %v", msg.post.ID, msg.renderErr))
	} else {
		if msg.printErr != nil {
			m.addLog(fmt.Sprintf("%s [print error: %v]", msg.pdfPath, msg.printErr))
		} else {
			m.addLog(msg.pdfPath)
			if msg.printed {
				m.addLog(fmt.Sprintf("[print] Sent to %s", m.printer.printerName))
			}
		}
	}
	if len(m.queue) > 0 {
		m.queue = m.queue[1:]
	}
	if len(m.queue) > 0 {
		m.status = fmt.Sprintf("Rendering %d remaining", len(m.queue))
		return m, tea.Batch(m.spinner.Tick, processPostCmd(m.ctx, m.browser, m.downloadsDir, m.base, m.queue[0], m.printer.printerName, debugFn(m.debug)))
	}
	m.status = "Watching for new posts..."
	return m, tea.Tick(pollInterval, func(time.Time) tea.Msg { return tickMsg{} })
}

func (m runModel) handleTick() (tea.Model, tea.Cmd) {
	return m, pollCmd(m.ctx, m.client, m.base, m.targetID, debugFn(m.debug))
}

func launchCmd(ctx context.Context, debug func(string, ...any)) tea.Cmd {
	return func() tea.Msg {
		debug("installing Playwright browsers (may download ~200MB on first run)...")
		pw, browser, err := startBrowser(ctx, debug)
		if err == nil {
			debug("Playwright ready")
		} else {
			debug("Playwright startup error: %v", err)
		}
		return launchedMsg{pw: pw, browser: browser, err: err}
	}
}

func renderCmd(ctx context.Context, browser playwright.Browser, downloadsDir, base, postID string, debug func(string, ...any)) tea.Cmd {
	return func() tea.Msg {
		path, w, h, err := renderPostPDF(ctx, browser, downloadsDir, base, postID, debug)
		return renderMsg{postID: postID, pdfPath: path, width: w, height: h, err: err}
	}
}

func printCmd(ctx context.Context, printer, pdfPath string, width, height int, debug func(string, ...any)) tea.Cmd {
	return func() tea.Msg {
		err := printPDF(ctx, printer, pdfPath, width, height, debug)
		return printMsg{postID: filepath.Base(pdfPath), printer: printer, err: err}
	}
}

func spaceInitCmd(ctx context.Context, client *http.Client, base, spaceID string, debug func(string, ...any)) tea.Cmd {
	return func() tea.Msg {
		posts, err := fetchPosts(ctx, client, base, spaceID, debug)
		return spaceInitMsg{posts: posts, err: err}
	}
}

func pollCmd(ctx context.Context, client *http.Client, base, spaceID string, debug func(string, ...any)) tea.Cmd {
	return func() tea.Msg {
		posts, err := fetchPosts(ctx, client, base, spaceID, debug)
		return pollMsg{posts: posts, err: err}
	}
}

func processPostCmd(ctx context.Context, browser playwright.Browser, downloadsDir, base string, p post, printer string, debug func(string, ...any)) tea.Cmd {
	return func() tea.Msg {
		path, w, h, err := renderPostPDF(ctx, browser, downloadsDir, base, p.ID, debug)
		if err != nil {
			return processMsg{post: p, renderErr: err}
		}
		if printer != "" {
			if err := printPDF(ctx, printer, path, w, h, debug); err != nil {
				return processMsg{post: p, pdfPath: path, printed: true, printErr: err}
			}
			return processMsg{post: p, pdfPath: path, printed: true}
		}
		return processMsg{post: p, pdfPath: path}
	}
}

func (m runModel) addLog(line string) runModel {
	m.logs = append(m.logs, line)
	return m
}

func defaultBase(local bool) string {
	if local {
		return "http://localhost:3000"
	}
	return "https://" + productionHost
}

func resolveSpaceInput(raw string) (string, string, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return "", "", errors.New("space input is empty")
	}

	if strings.HasPrefix(raw, "http://") || strings.HasPrefix(raw, "https://") {
		u, err := url.Parse(raw)
		if err != nil {
			return "", "", err
		}
		if u.Scheme == "" {
			u.Scheme = "https"
		}
		if u.Host == "" {
			return "", "", errors.New("missing host")
		}
		host := strings.ToLower(u.Hostname())
		if host != productionHost && host != localHost {
			return "", "", fmt.Errorf("unexpected host: %s", u.Host)
		}
		parts := strings.Split(strings.Trim(u.Path, "/"), "/")
		if len(parts) < 2 || parts[0] != "spaces" {
			return "", "", fmt.Errorf("unrecognized space path: %s", u.Path)
		}
		spaceID, err := canonicalSpaceID(parts[1])
		if err != nil {
			return "", "", err
		}
		base := fmt.Sprintf("%s://%s", u.Scheme, u.Host)
		return base, spaceID, nil
	}

	spaceID, err := canonicalSpaceID(raw)
	if err != nil {
		return "", "", err
	}
	return defaultBase(false), spaceID, nil
}

func canonicalSpaceID(input string) (string, error) {
	parts := strings.Split(input, "-")
	raw := parts[len(parts)-1]
	raw = strings.ReplaceAll(raw, "-", "")
	if len(raw) != 32 {
		return "", fmt.Errorf("invalid space id format: %s", input)
	}
	return fmt.Sprintf("%s-%s-%s-%s-%s",
		raw[0:8], raw[8:12], raw[12:16], raw[16:20], raw[20:32],
	), nil
}

func defaultDownloadsDir() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, "Downloads"), nil
}

func listPrinters(ctx context.Context, debug func(string, ...any)) ([]string, error) {
	cmd := exec.CommandContext(ctx, "lpstat", "-p")
	out, err := cmd.Output()
	if err != nil {
		return nil, err
	}
	lines := strings.Split(string(out), "\n")
	var printers []string
	for _, line := range lines {
		fields := strings.Fields(line)
		if len(fields) >= 2 && fields[0] == "printer" {
			printers = append(printers, fields[1])
		}
	}
	debug("found printers: %v", printers)
	return printers, nil
}

func buildPrinterList(ctx context.Context, debug bool) list.Model {
	printers, err := listPrinters(ctx, func(string, ...any) {})
	if err != nil && debug {
		log.Printf("[debug] printer discovery failed: %v", err)
	}

	items := []list.Item{&printerChoice{
		title:       "Save to Downloads only",
		description: "Do not send to a printer; save PDF in Downloads",
		saveOnly:    true,
	}}
	for _, name := range printers {
		items = append(items, &printerChoice{
			title:       name,
			description: "Send PDF to this printer",
			printerName: name,
		})
	}

	delegate := newCompactDelegate(true)
	l := list.New(items, delegate, 50, max(10, len(items)+2))
	l.Title = "Select a printer (default: save only)"
	l.SetFilteringEnabled(false)
	l.SetShowStatusBar(false)
	l.SetShowHelp(false)
	l.SetShowPagination(false)
	l.Select(0)
	return l
}

func startBrowser(ctx context.Context, debug func(string, ...any)) (*playwright.Playwright, playwright.Browser, error) {
	// Suppress playwright's internal slog output (we have our own debug messages)
	origHandler := slog.Default().Handler()
	slog.SetDefault(slog.New(discardHandler{}))
	defer slog.SetDefault(slog.New(origHandler))

	installCtx, cancel := context.WithTimeout(ctx, 3*time.Minute)
	defer cancel()
	if err := waitFor(installCtx, func() error { return playwright.Install() }); err != nil {
		return nil, nil, err
	}
	debug("install finished")
	runCtx, cancelRun := context.WithTimeout(ctx, time.Minute)
	defer cancelRun()
	pw, err := waitForResult(runCtx, func() (*playwright.Playwright, error) {
		return playwright.Run()
	})
	if err != nil {
		return nil, nil, err
	}
	debug("playwright.Run ok")
	launchCtx, cancelLaunch := context.WithTimeout(ctx, time.Minute)
	defer cancelLaunch()
	browser, err := waitForResult(launchCtx, func() (playwright.Browser, error) {
		return pw.Chromium.Launch(playwright.BrowserTypeLaunchOptions{
			Headless: playwright.Bool(true),
		})
	})
	if err != nil {
		pw.Stop()
		return nil, nil, err
	}
	debug("chromium launch ok")
	return pw, browser, nil
}

func waitFor(ctx context.Context, fn func() error) error {
	done := make(chan error, 1)
	go func() { done <- fn() }()
	select {
	case <-ctx.Done():
		return ctx.Err()
	case err := <-done:
		return err
	}
}

func waitForResult[T any](ctx context.Context, fn func() (T, error)) (T, error) {
	done := make(chan struct{})
	var (
		result T
		err    error
	)
	go func() {
		result, err = fn()
		close(done)
	}()
	select {
	case <-ctx.Done():
		var zero T
		return zero, ctx.Err()
	case <-done:
		return result, err
	}
}

func fetchPosts(ctx context.Context, client *http.Client, base, spaceID string, debug func(string, ...any)) ([]post, error) {
	url := fmt.Sprintf("%s/spaces/%s/posts.json", base, spaceID)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("fetch posts: %s", resp.Status)
	}

	var body postsResponse
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return nil, err
	}
	debug("fetched %d posts", len(body.Posts))
	return body.Posts, nil
}

func renderPostPDF(ctx context.Context, browser playwright.Browser, downloadsDir, base, postID string, debug func(string, ...any)) (string, int, int, error) {
	page, err := browser.NewPage()
	if err != nil {
		return "", 0, 0, err
	}
	defer page.Close()

	printURL := fmt.Sprintf("%s/posts/%s/print", base, postID)
	debug("opening %s", printURL)

	if _, err := page.Goto(printURL, playwright.PageGotoOptions{
		WaitUntil: playwright.WaitUntilStateNetworkidle,
	}); err != nil {
		return "", 0, 0, err
	}

	if _, err := page.WaitForSelector(postCardSelector, playwright.PageWaitForSelectorOptions{
		Timeout: playwright.Float(10_000),
	}); err != nil {
		return "", 0, 0, err
	}

	_, _ = page.Evaluate(`() => document.fonts && document.fonts.ready ? document.fonts.ready : null`)

	if err := page.EmulateMedia(playwright.PageEmulateMediaOptions{Media: playwright.MediaScreen}); err != nil {
		return "", 0, 0, err
	}

	size, err := measureElement(page, postCardSelector)
	if err != nil {
		return "", 0, 0, err
	}

	outputPath := filepath.Join(downloadsDir, fmt.Sprintf("%s.pdf", postID))
	if _, err := page.PDF(playwright.PagePdfOptions{
		Path:            playwright.String(outputPath),
		Width:           playwright.String(fmt.Sprintf("%dpx", size.width)),
		Height:          playwright.String(fmt.Sprintf("%dpx", size.height)),
		PrintBackground: playwright.Bool(true),
	}); err != nil {
		return "", 0, 0, err
	}

	return outputPath, size.width, size.height, nil
}

type elementSize struct {
	width  int
	height int
}

func measureElement(page playwright.Page, selector string) (elementSize, error) {
	result, err := page.Evaluate(`(selector) => {
		const el = document.querySelector(selector);
		if (!el) throw new Error("element not found");
		const rect = el.getBoundingClientRect();
		return { width: Math.ceil(rect.width), height: Math.ceil(rect.height) };
	}`, selector)
	if err != nil {
		return elementSize{}, err
	}
	if m, ok := result.(map[string]any); ok {
		w := int(toFloat(m["width"]))
		h := int(toFloat(m["height"]))
		return elementSize{width: w, height: h}, nil
	}
	return elementSize{}, errors.New("unexpected measurement result")
}

func toFloat(v any) float64 {
	switch val := v.(type) {
	case float64:
		return val
	case float32:
		return float64(val)
	case int:
		return float64(val)
	case int64:
		return float64(val)
	default:
		return 0
	}
}

func printPDF(ctx context.Context, printer, pdfPath string, widthPx, heightPx int, debug func(string, ...any)) error {
	widthMM := int(math.Ceil(float64(widthPx) * 25.4 / 96.0))
	heightMM := int(math.Ceil(float64(heightPx) * 25.4 / 96.0))
	args := []string{
		"-d", printer,
		"-o", fmt.Sprintf("media=Custom.%dx%dmm", widthMM, heightMM),
		"-o", "fit-to-page",
		pdfPath,
	}
	debug("lp %v", args)
	cmd := exec.CommandContext(ctx, "lp", args...)
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("lp error: %v: %s", err, string(out))
	}
	return nil
}

func filterNewPosts(posts []post, seen map[string]struct{}, latest *time.Time) []post {
	var newPosts []post
	for _, p := range posts {
		if _, ok := seen[p.ID]; ok {
			continue
		}
		t, err := time.Parse(time.RFC3339, p.CreatedAt)
		if err != nil {
			continue
		}
		if latest.IsZero() || t.After(*latest) {
			newPosts = append(newPosts, p)
			seen[p.ID] = struct{}{}
			if t.After(*latest) {
				*latest = t
			}
		}
	}
	return newPosts
}

func debugFn(enabled bool) func(string, ...any) {
	if !enabled {
		return func(string, ...any) {}
	}
	return func(msg string, args ...any) {
		line := fmt.Sprintf("[debug] "+msg, args...)
		select {
		case debugBus <- line:
		default:
		}
	}
}

var debugBus = make(chan string, 256)

func debugListener() tea.Cmd {
	return func() tea.Msg {
		line, ok := <-debugBus
		if !ok {
			return nil
		}
		return debugMsg{line: line}
	}
}

// discardHandler is a slog.Handler that discards all log records.
type discardHandler struct{}

func (discardHandler) Enabled(context.Context, slog.Level) bool  { return false }
func (discardHandler) Handle(context.Context, slog.Record) error { return nil }
func (d discardHandler) WithAttrs([]slog.Attr) slog.Handler      { return d }
func (d discardHandler) WithGroup(string) slog.Handler           { return d }
