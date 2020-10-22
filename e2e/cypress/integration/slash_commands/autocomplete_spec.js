// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @integrations

/**
 * Note : This test requires the demo plugin tar file under fixtures folder.
 * Download :
 * https://github.com/mattermost/mattermost-plugin-demo/releases/download/v0.8.0/com.mattermost.demo-plugin-0.8.0.tar.gz
 * Copy to : ./e2e/cypress/fixtures/com.mattermost.demo-plugin-0.8.0.tar.gz

 * Note : This test requires the jira plugin tar file under fixtures folder.
 * Download :
 * https://github.com/mattermost/mattermost-plugin-jira/releases/download/v3.0.0/jira-3.0.0.tar.gz
 * Copy to : ./e2e/cypress/fixtures/jira-3.0.0.tar.gz
 */

describe('Integrations', () => {
    const pluginIdDemo = 'com.mattermost.demo-plugin';
    const pluginIdJira = 'jira';
    const pluginIdAgenda = 'com.mattermost.agenda';

    before(() => {
        // # Initialize setup and visit town-square
        cy.apiInitSetup().then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);

            // # If Demo plugin is already enabled, uninstall it
            // cy.apiRemovePluginById(pluginIdDemo);
        });

        const demoURL = 'https://github.com/mattermost/mattermost-plugin-demo/releases/download/v0.8.0/com.mattermost.demo-plugin-0.8.0.tar.gz';
        const jiraURL = 'https://github.com/mattermost/mattermost-plugin-jira/releases/download/v3.0.0/jira-3.0.0.tar.gz ';
        const agendaURL = 'https://github.com/mattermost/mattermost-plugin-agenda/releases/download/v0.2.1/com.mattermost.agenda-0.2.1.tar.gz';

        // # Install plugins from URL
        // cy.apiInstallPluginFromUrl(demoURL);
        // cy.apiInstallPluginFromUrl(jiraURL);
        // cy.apiInstallPluginFromUrl(agendaURL);

        // cy.apiUploadPlugin('filename');
    });

    after(() => {
        // cy.apiRemovePluginById(pluginIdDemo);
        // cy.apiRemovePluginById(pluginIdJira);
        // cy.apiRemovePluginById(pluginIdAgenda);
    });

    it('T2834 Slash command help stays visible for system slash command', () => {
        // # Post a slash command without trailing space
        cy.get('#post_textbox').type('/rename');

        // * Verify suggestion list is visible with only 1 child
        cy.get('#suggestionList').should('be.visible').children().should('have.length', 1);

        // * Verify suggestion list is visible
        cy.get('#suggestionList').children().eq(0).findByText('Rename the channel').should('be.visible');

        // # Add trailing space to '/rename' command
        cy.get('#post_textbox').type(' ');

        // * Verify command text is no longer visible after space is added
        cy.findByText('Rename the channel').should('not.be.visible');

        // * Verify suggestion list is visible with 2 children
        cy.get('#suggestionList').should('be.visible').children().should('have.length', 2);

        // * Verify execute current command text shows in first element
        cy.get('#suggestionList').children().eq(0).findByText('Execute Current Command').should('be.visible');

        // * After typing the space character the relevant tip is still displayed
        cy.get('.slash-command__desc').contains('[text]').should('be.visible');
    });

    it('T2835 Slash command help stays visible for plugin', () => {
        // # Post a slash command without trailing space
        cy.get('#post_textbox').clear().type('/jira ');

        // * Verify suggestion list is visible with 11 children
        cy.get('#suggestionList').should('be.visible').children().should('have.length', 11);
    });

    it('T2829 Test an example of plugin that uses sub commands', () => {
        // # Post a slash command with trailing space
        cy.get('#post_textbox').clear().type('/jira ');

        // * Verify suggestion list is visible
        cy.get('#suggestionList').findByText('info').scrollIntoView().should('be.visible');

        // # Narrow down list to show info only suggestion
        cy.get('#post_textbox').type('inf');

        // * Verify suggestion list is visible with only 1 child
        cy.get('#suggestionList').should('be.visible').children().should('have.length', 1);

        // * Verify list is refined to only the info sub command
        cy.get('#suggestionList').findByText('info').should('be.visible');

        // # click the info subcommand and hit enter
        cy.get('#suggestionList').findByText('info').should('be.visible').click();
        cy.get('#post_textbox').type('{enter}');

        // * Verify message is sent and (only visible to you)
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).
                should('contain.text', '(Only visible to you)').
                should('contain.text', 'is not a valid Mattermost SITEURL.');
        });
    });

    it.only('T2830 Test an example of plugin using static list', () => {
        // # Post a slash command with trailing space
        cy.get('#post_textbox').clear().type('/jira ');

        // * Verify suggestion list is visible
        cy.get('#suggestionList').should('contain.text', 'instance').scrollIntoView().should('be.visible');

        // # Narrow down list to show info only suggestion
        cy.get('#post_textbox').type('i');

        // * Verify suggestion list is visible with at three children (issue, instance, info)
        cy.get('#suggestionList').should('be.visible').children().
            should('contain.text', 'issue').
            should('contain.text', 'instance').
            should('contain.text', 'info');

        // # Clear test and Post a slash command with trailing space
        cy.get('#post_textbox').clear().type('/jira instance settings ');

        // * Verify suggestion notifications is visible
        cy.get('#suggestionList').should('contain.text', 'notifications').scrollIntoView().should('be.visible');

        // # Clear test and Post a slash command with trailing space
        cy.get('#post_textbox').type('notifications ');

        // * Verify suggestion list is visible with at three children (issue, instance, info)
        cy.get('#suggestionList').should('be.visible').children().
            should('contain.text', 'on').
            should('contain.text', 'off');

        cy.get('#suggestionList').type('{upArrow}');
        cy.get('#suggestionList').type('{downArrow}').click();

        // // * Verify list is refined to settings and subscribe commands
        // cy.get('#suggestionList').findByText('settings').should('be.visible');
        // cy.get('#suggestionList').findByText('subscribe').should('be.visible');
        //
        // // # Narrow down list to show info only suggestion
        // cy.get('#post_textbox').type('e');
        //
        // // * Verify suggestion list is visible with only 1 child
        // cy.get('#suggestionList').should('be.visible').children().should('have.length', 1);
        //
        // // * Verify list is refined to settings sub command
        // cy.get('#suggestionList').findByText('settings').should('be.visible');
        //
        // // # click the info subcommand and hit enter
        // cy.get('#suggestionList').findByText('settings').should('be.visible').click();
        // cy.get('#post_textbox').type('{enter}');
        //
        // // # click the info subcommand and hit enter
        // cy.get('#suggestionList').findByText('info').should('be.visible').click();
        // cy.get('#post_textbox').type('{enter}');
        //
        // // * Verify message is sent and (only visible to you)
        // cy.getLastPostId().then((postId) => {
        //     cy.get(`#post_${postId}`).
        //         should('contain.text', '(Only visible to you)').
        //         should('contain.text', 'is not a valid Mattermost SITEURL.');
        // });
    });
});
