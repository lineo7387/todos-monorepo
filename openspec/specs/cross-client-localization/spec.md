## Purpose

Define shared workspace-shell localization resources and terminology consistency across supported clients and locales.

## Requirements

### Requirement: Workspace shell copy uses shared translation keys across supported clients

The system SHALL define one shared translation-key contract for workspace-shell destinations, actions, feedback, and empty states across web, desktop, and mobile clients.

#### Scenario: Workspace shell renders on multiple clients

- **WHEN** the workspace shell renders `dashboard`, `my workspace`, `team list`, `team detail`, `join team`, or `create team` on any supported client
- **THEN** the client resolves page copy from the shared workspace-shell translation keys instead of client-local hardcoded strings

### Requirement: Workspace shell supports English and Chinese from the same resource contract

The system SHALL provide English and Chinese resources for the shared workspace-shell translation-key contract.

#### Scenario: User switches supported languages

- **WHEN** a user views the workspace shell in English or Chinese on any supported client
- **THEN** the same shared translation keys resolve to the selected language without changing the underlying destination model or business behavior

### Requirement: Core workspace terminology stays consistent across clients and locales

The system SHALL keep the core product terms `dashboard`, `my workspace`, and `team` consistent across web, desktop, and mobile in each supported language.

#### Scenario: User moves between clients

- **WHEN** a user moves between supported clients in the same language
- **THEN** the workspace shell uses the same localized labels for core destinations and shared workspace concepts on each client
