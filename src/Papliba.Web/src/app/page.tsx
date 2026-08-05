"use client";

import { FormEvent, useState } from "react";

export default function Home() {
  const [organizationName, setOrganizationName] = useState("");
  const [draftOrganizationName, setDraftOrganizationName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState<string[]>([]);

  function createOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextOrganizationName = draftOrganizationName.trim();

    if (!nextOrganizationName) {
      return;
    }

    setOrganizationName(nextOrganizationName);
    setDraftOrganizationName("");
    setProjects([]);
  }

  function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextProjectName = projectName.trim();

    if (!nextProjectName) {
      return;
    }

    setProjects((currentProjects) => [...currentProjects, nextProjectName]);
    setProjectName("");
  }

  if (!organizationName) {
    return (
      <main className="setup-shell">
        <section className="setup-panel">
          <p className="eyebrow">Papliba</p>
          <h1>Create an organization</h1>
          <p>
            Start with one organization. Projects will be created inside it.
          </p>

          <form className="setup-form" onSubmit={createOrganization}>
            <input
              aria-label="Organization name"
              onChange={(event) =>
                setDraftOrganizationName(event.target.value)
              }
              placeholder="Organization name"
              type="text"
              value={draftOrganizationName}
            />
            <button type="submit">Create organization</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Organization</p>
          <h1>{organizationName}</h1>
        </div>
        <button
          className="secondary-button"
          onClick={() => setOrganizationName("")}
          type="button"
        >
          New organization
        </button>
      </header>

      <section className="workspace" aria-label="Papliba organization workspace">
        <aside className="organization-panel">
          <p className="eyebrow">Current organization</p>
          <strong>{organizationName}</strong>
          <span>Projects live inside this organization.</span>
        </aside>

        <section className="projects-panel">
          <div className="projects-header">
            <div>
              <p className="eyebrow">Projects</p>
              <h2>All projects</h2>
            </div>
            <form className="project-form" onSubmit={createProject}>
              <input
                aria-label="Project name"
                onChange={(event) => setProjectName(event.target.value)}
                placeholder="Project name"
                type="text"
                value={projectName}
              />
              <button type="submit">New project</button>
            </form>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <h3>No projects yet</h3>
              <p>Create the first project inside this organization.</p>
            </div>
          ) : (
            <div className="project-grid">
              {projects.map((project) => (
                <article className="project-card" key={project}>
                  <strong>{project}</strong>
                  <span>Project workspace</span>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
