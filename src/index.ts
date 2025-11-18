#!/usr/bin/env node

/**
 * BuyICT MCP Server
 *
 * Provides access to Australian Government ICT procurement opportunities
 * through the Model Context Protocol (MCP).
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { ServiceNowClient } from './servicenow-client.js';
import type {
  BuyICTConfig,
  AuthConfig,
  OpportunitySearchParams,
} from './types.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load configuration
const configPath = join(__dirname, '../config/buyict-config.json');
const config: BuyICTConfig = JSON.parse(readFileSync(configPath, 'utf-8'));

// Load authentication from environment variables
const auth: AuthConfig = {
  sessionId: process.env.BUYICT_SESSION_ID,
  userToken: process.env.BUYICT_USER_TOKEN,
  uxToken: process.env.BUYICT_UX_TOKEN,
  glideUserRoute: process.env.BUYICT_GLIDE_USER_ROUTE,
  glideNodeId: process.env.BUYICT_GLIDE_NODE_ID,
  valkSessionId: process.env.BUYICT_VALK_SESSION_ID,
};

// Create ServiceNow client
const snClient = new ServiceNowClient(config, auth);

// Define MCP tools
const TOOLS: Tool[] = [
  {
    name: 'search_opportunities',
    description: 'Search for procurement opportunities on BuyICT with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'Search term to filter opportunities'
        },
        marketplace: {
          type: 'string',
          description: 'Filter by marketplace code (e.g., PCS, SMP, CMP, LH, TMP, DC, HMP)',
          enum: config.marketplaces.map(m => m.code)
        },
        page_size: {
          type: 'number',
          description: 'Number of results per page (default: 15)',
          minimum: 1,
          maximum: 100,
          default: 15
        },
        page: {
          type: 'number',
          description: 'Page number (default: 1)',
          minimum: 1,
          default: 1
        }
      }
    }
  },
  {
    name: 'get_opportunity_details',
    description: 'Get detailed information about a specific opportunity',
    inputSchema: {
      type: 'object',
      properties: {
        opportunity_id: {
          type: 'string',
          description: 'The sys_id of the opportunity'
        },
        table: {
          type: 'string',
          description: 'The source table name (e.g., u_pcs_procurement, u_smp_procurement)'
        }
      },
      required: ['opportunity_id', 'table']
    }
  },
  {
    name: 'list_marketplaces',
    description: 'Get list of available marketplaces/procurement types',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

// Create MCP server
const server = new Server(
  {
    name: 'buyict-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_opportunities': {
        const params = args as OpportunitySearchParams;
        const result = await snClient.searchOpportunities(params);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_opportunity_details': {
        const { opportunity_id, table } = args as {
          opportunity_id: string;
          table: string;
        };

        const details = await snClient.getOpportunityDetails(opportunity_id, table);

        if (!details) {
          return {
            content: [
              {
                type: 'text',
                text: `Opportunity not found: ${opportunity_id} in table ${table}`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(details, null, 2),
            },
          ],
        };
      }

      case 'list_marketplaces': {
        const marketplaces = snClient.getMarketplaces();

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(marketplaces, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('BuyICT MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
