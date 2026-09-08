use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct MerkleProof {
    pub leaf_index: usize,
    pub total_leaves: usize,
    pub siblings: Vec<([u8; 32], bool)>, // (sibling_hash, is_right_sibling)
    pub parent_root: Option<[u8; 32]>,
}

#[derive(Debug, Clone)]
pub struct MerkleTree {
    pub leaves: Vec<[u8; 32]>,
    pub parent_root: Option<[u8; 32]>,
    levels: Vec<Vec<[u8; 32]>>,
}

fn hash_pair(left: &[u8; 32], right: &[u8; 32]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(b"STATEGUARD_MERKLE_NODE:");
    hasher.update(left);
    hasher.update(right);
    let result = hasher.finalize();
    let mut out = [0u8; 32];
    out.copy_from_slice(&result);
    out
}

pub fn hash_leaf(data: &[u8]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(b"STATEGUARD_MERKLE_LEAF:");
    hasher.update(data);
    let result = hasher.finalize();
    let mut out = [0u8; 32];
    out.copy_from_slice(&result);
    out
}

impl MerkleTree {
    pub fn from_leaf_hashes(leaves: Vec<[u8; 32]>) -> Self {
        Self::from_leaf_hashes_with_parent(leaves, None)
    }

    pub fn from_leaf_hashes_with_parent(leaves: Vec<[u8; 32]>, parent_root: Option<[u8; 32]>) -> Self {
        if leaves.is_empty() {
            let empty_root = hash_leaf(b"EMPTY_TREE");
            return Self {
                leaves: vec![],
                parent_root,
                levels: vec![vec![empty_root]],
            };
        }

        let mut levels = Vec::new();
        levels.push(leaves.clone());

        let mut current_level = leaves.clone();
        while current_level.len() > 1 {
            let mut next_level = Vec::new();
            for chunk in current_level.chunks(2) {
                if chunk.len() == 2 {
                    next_level.push(hash_pair(&chunk[0], &chunk[1]));
                } else {
                    // Duplicate last odd node
                    next_level.push(hash_pair(&chunk[0], &chunk[0]));
                }
            }
            levels.push(next_level.clone());
            current_level = next_level;
        }

        Self {
            leaves,
            parent_root,
            levels,
        }
    }

    pub fn from_raw_envelopes(envelopes: &[&[u8]]) -> Self {
        let leaves: Vec<[u8; 32]> = envelopes.iter().map(|e| hash_leaf(e)).collect();
        Self::from_leaf_hashes(leaves)
    }

    pub fn with_parent_root(mut self, parent: [u8; 32]) -> Self {
        self.parent_root = Some(parent);
        self
    }

    /// Spawns a child branch execution tree recording this tree's root as its parent root
    pub fn fork_child_tree(&self, child_leaves: Vec<[u8; 32]>) -> Self {
        Self::from_leaf_hashes_with_parent(child_leaves, Some(self.root()))
    }

    pub fn root(&self) -> [u8; 32] {
        if let Some(top) = self.levels.last() {
            if let Some(root) = top.first() {
                return *root;
            }
        }
        hash_leaf(b"EMPTY_TREE")
    }

    pub fn generate_proof(&self, leaf_index: usize) -> Option<MerkleProof> {
        if leaf_index >= self.leaves.len() {
            return None;
        }

        let mut siblings = Vec::new();
        let mut idx = leaf_index;

        for level in &self.levels[0..self.levels.len() - 1] {
            let is_right = idx % 2 == 1;
            let sibling_idx = if is_right { idx - 1 } else { idx + 1 };

            let sibling_hash = if sibling_idx < level.len() {
                level[sibling_idx]
            } else {
                level[idx]
            };

            siblings.push((sibling_hash, !is_right));
            idx /= 2;
        }

        Some(MerkleProof {
            leaf_index,
            total_leaves: self.leaves.len(),
            siblings,
            parent_root: self.parent_root,
        })
    }
}

pub fn verify_proof(root: &[u8; 32], leaf: &[u8; 32], proof: &MerkleProof) -> bool {
    let mut current = *leaf;
    for (sibling, is_right_sibling) in &proof.siblings {
        current = if *is_right_sibling {
            hash_pair(&current, sibling)
        } else {
            hash_pair(sibling, &current)
        };
    }
    &current == root
}

/// Verifies that a child branch tree's recorded parent root matches the expected origin parent root
pub fn verify_branch_origin(child_tree: &MerkleTree, expected_parent_root: &[u8; 32]) -> bool {
    if let Some(ref parent) = child_tree.parent_root {
        parent == expected_parent_root
    } else {
        false
    }
}
