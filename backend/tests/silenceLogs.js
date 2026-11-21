// Controllers console.log caught errors; keep test output readable.
beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
});
